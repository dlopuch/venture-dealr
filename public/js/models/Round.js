var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;

var EquityStake = require('./EquityStake');
var Investment = require('./Investment');
var ShareClass = require('./ShareClass');

var id = 0;

var STAKES_TO_NUM_SHARES_REDUCER = function(sum, equityStake) {
  return sum + equityStake.numShares;
};

module.exports = class Round extends EventEmitter {

  /**
   * @param {string} name Name of the round, eg "Founding", "Seed", "Series A", "The Super Awesome Exit"
   * @param {models.Round | null} prevRound Previous round (unless first round)
   * @param {number} preMoneyValuation Company value before the round
   * @param {Object} [optionsPool] Round options pool spec, like:
   *   type: {'pre' | 'post'} Is the round's option pool specified pre-money or post-money (the "option pool shuffle").
   *   percent: {number} Number between 0 and 1.  Specifies how many shares are created for the options pool.
   */
  constructor(name, prevRound, preMoneyValuation, optionsPool={type:'post', percent: 0}) {
    if (prevRound && !(prevRound instanceof Round))
      throw new Error('Invalid round!');

    super();

    this.id = 'round_' + (id++);

    this.name = name;

    this.preMoneyValuation = preMoneyValuation;
    this.prevRound = prevRound || null;

    this._investments = [];
    this._equityStakes = [];

    if (optionsPool.type !== 'post')
      throw new Error('Pre-money options pool not yet supported');
    this._roundOptionsPoolSpec = optionsPool;
  }

  getRoundMoney() {
    return this._investments.reduce(function(s, investment) { return s + investment.money; }, 0);
  }

  getPostMoney() {
    return this.preMoneyValuation + this.getRoundMoney();
  }

  addInvestment(investment) {
    if (!(investment instanceof Investment))
      throw new Error('Invalid investment');

    this._investments.push(investment);
    return this;
  }

  /**
   * Returns all Investments's up to and (by default) including this Round.
   * @param {Object} [opts]
   *   onlyPrevRounds: {boolean} Only the Investments from previous rounds (ie not including this round)
   * @returns {Array(Investment)} All Investments
   */
  getAllInvestments(opts={}) {
    var investments = opts.onlyPrevRounds ? [] : _.clone(this._investments);

    var prevRound = this.prevRound;
    while (prevRound) {
      investments = investments.concat(prevRound._investments);
      prevRound = prevRound.prevRound;
    }
    return investments;
  }

  addStake(equityStake) {
    if (!(equityStake instanceof EquityStake))
      throw new Error('Invalid investment');

    this._equityStakes.push(equityStake);
    return this;
  }

  removeStake(toDeleteStake) {
    this._equityStakes = this._equityStakes.filter(function(stake) { return stake !== toDeleteStake; });
    return this;
  }

  /**
   * Returns all EquityStake's up to and (by default) including this Round.
   * @param {Object} [opts]
   *   onlyPrevRounds: {boolean} Only the EquityStakes from previous rounds (ie not including this round)
   * @returns {Array(EquityStake)} All EquityStakes
   */
  getAllStakes(opts={}) {
    var stakes = opts.onlyPrevRounds ? [] : _.clone(this._equityStakes);

    var prevRound = this.prevRound;
    while (prevRound) {
      stakes = stakes.concat(prevRound._equityStakes);
      prevRound = prevRound.prevRound;
    }
    return stakes;
  }

  calculateStats() {
    var stats = {
      stakesAndPercentages: null, // {Array}, calculated below
      numSharesPostMoney: 0,
      preMoney: this.preMoneyValuation,
      roundMoney: 0,
      postMoney: 0,
      sharePrice: null,
    };

    var stakes = this.getAllStakes();
    var preAndRoundStakes = _.partition(stakes, s => s.round !== this);
    var priorStakes = preAndRoundStakes[0];
    var roundStakes = preAndRoundStakes[1];

    stats.numSharesPostMoney = stakes.reduce(STAKES_TO_NUM_SHARES_REDUCER, 0);
    var numPriorShares = priorStakes.reduce(STAKES_TO_NUM_SHARES_REDUCER, 0);


    var investments = this.getAllInvestments();
    var preAndRoundInvestments = _.partition(investments, i => i.round !== this);
    var priorInvestments = preAndRoundInvestments[0];
    var roundInvestments = preAndRoundInvestments[1];

    stats.roundMoney = roundInvestments.reduce((sum, investment) => sum + investment.money, 0);
    stats.postMoney = stats.preMoney + stats.roundMoney;


    // Share price only exists if there were investments this round
    if (roundInvestments.length) {
      // Share price calculation depends on whether the "option pool shuffle" (post-round option pool) is used or not.
      if (this._roundOptionsPoolSpec.type === 'pre') {
        throw new Error('Only post-money option pool percentages ("option pool shuffle") are supported');

      } else {
        if (numPriorShares <= 0) {
          // TODO: Allow investments specified in terms of post-money percentage
          throw new Error('Cannot price round shares when no prior shares exist');
        }

        // TODO: Add debt into the numerator
        stats.sharePrice = (stats.preMoney - (stats.roundMoney * this._roundOptionsPoolSpec.percent)) / numPriorShares;
      }


      // Now that we know the share price, figure out how much equity each investment bought
      var anyChanged = false;
      roundInvestments.forEach(function(investment) {
        anyChanged = this._calculateInvestmentEquity(stats, investment) || anyChanged;
      }.bind(this));

      if (anyChanged) {
        stakes = this.getAllStakes();
        roundStakes = null; // possibly dirty, don't use
        stats.numSharesPostMoney = stakes.reduce(STAKES_TO_NUM_SHARES_REDUCER, 0);
      }
    }


    // Finally, calculate percentages
    stats.stakesAndPercentages = stakes.map(
      stake => ({stake: stake, percentage: stake.numShares / stats.numSharesPostMoney})
    );

    return stats;
  }

  /**
   * Calculates how much equity has been purchased for the investment.
   *
   * If equity is not yet known, it is created and registered with the entities
   *
   * @param {Object} roundStats Object like:
   *   .sharePrice: {number} Cost per share
   * @param {models.Investment} investment
   * @return {boolean} True if the equity has changed, false otherwise
   */
  _calculateInvestmentEquity(roundStats, investment) {
    if (roundStats.sharePrice <= 0)
      throw new Error('Cannot make investment with 0 or negative share price');

    var numShares = investment.money / roundStats.sharePrice;

    var stakeChanged = false;

    var stake = investment.equityStake;
    if (!stake) {
      stake = new EquityStake(this, numShares, ShareClass.PREFERRED, {fromInvestment: investment});
      investment.equityStake = stake;
      stakeChanged = true;

    } else {
      if (numShares !== stake.numShares) {
        stake.numShares = numShares;
        stakeChanged = true;
      }
    }

    return stakeChanged;
  }


};
