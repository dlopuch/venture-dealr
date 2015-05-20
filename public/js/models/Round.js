var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;

var EquityStake = require('./EquityStake');
var Investment = require('./Investment');
var ShareClass = require('./ShareClass');

var id = 0;

var STAKES_TO_NUM_SHARES_REDUCER = function(sum, equityStake) {
  return sum + equityStake.numShares;
};

const EVENT_STATS_CHANGED = 'statsChanged';

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

    if (!_.isNumber(optionsPool.percent) || optionsPool.percent < 0 || 1 < optionsPool.percent)
      throw new Error('Options pool percent must be specified as number between 0-1');

    super();

    this.id = id++;

    this.name = name;

    this.preMoneyValuation = preMoneyValuation;

    this.prevRound = prevRound || null;
    if (prevRound) {
      this._handlePrevRoundChange = this._handlePrevRoundChange.bind(this);
      prevRound.on(EVENT_STATS_CHANGED, this._handlePrevRoundChange);
    }

    this._investments = [];
    this._equityStakes = [];

    if (optionsPool.type !== 'post')
      throw new Error('Pre-money options pool not yet supported');
    this._roundOptionsPoolSpec = optionsPool;
    this.roundOptionsPoolEquity = null;

    this.stats = null;
  }

  destroy() {
    this.prevRound.removeListener(this._handlePrevRoundChange);
    this.removeAllListeners();
  }

  _handlePrevRoundChange() {
    // If a previous round changed its stats, invalidate this round's changed stats and pass it up the chain.
    this.stats = null;
    this.emit(EVENT_STATS_CHANGED, this);
  }

  getRoundMoney() {
    return this._investments.reduce(function(s, investment) { return s + investment.money; }, 0);
  }

  getPostMoney() {
    return this.preMoneyValuation + this.getRoundMoney();
  }

  /**
   * Called by Investment constructor... Investments self-register with Rounds upon construction.
   * @param {models.Investment}
   */
  _registerInvestment(investment) {
    if (!(investment instanceof Investment))
      throw new Error('Invalid investment');

    this._investments.push(investment);

    this.stats = null;

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

  /**
   * Called by EquityStake constructor... EquityStakes self-register with Rounds upon construction.
   * @param {models.EquityStake}
   */
  _registerStake(equityStake) {
    if (!(equityStake instanceof EquityStake))
      throw new Error('Invalid investment');

    if (equityStake.round !== this)
      throw new Error('Cannot add equity stake -- part of a different round');

    if (equityStake.isOptionsPool && this.roundOptionsPoolEquity)
      throw new Error('Cannot add option pool -- round already has one');

    this._equityStakes.push(equityStake);

    if (equityStake.isOptionsPool) {
      this.roundOptionsPoolEquity = equityStake;
    }

    this.stats = null;

    return this;
  }

  removeStake(toDeleteStake) {
    this._equityStakes = this._equityStakes.filter(function(stake) { return stake !== toDeleteStake; });

    this.stats = null;

    return this;
  }

  /**
   * Returns all EquityStake's up to and (by default) including this Round.
   *
   * @param {Object} [opts]
   *   [onlyPrevRounds]: {boolean} Only the EquityStakes from previous rounds (ie not including this round)
   *   [includeSubEquities]: {boolean} If true, won't filter 'double counting' equities that are part of a counted pool
   *     (eg will include pieces of the option pool as well as the option pool itself)
   * @returns {Array(EquityStake)} All EquityStakes
   */
  getAllStakes(opts={}) {
    var stakes = opts.onlyPrevRounds ? [] : _.clone(this._equityStakes);

    var prevRound = this.prevRound;
    while (prevRound) {
      stakes = stakes.concat(prevRound._equityStakes);
      prevRound = prevRound.prevRound;
    }

    if (!opts.includeSubEquities) {
      return stakes;
    }

    return stakes
    .filter(s => !s.opts.fromOptionsPool); // filter out "sub-equities" that are counted as part of the options pool
  }

  calculateStats() {
    // If memoized (not dirty), return existing stats
    if (this.stats) {
      return this.stats;
    }

    // Make sure previous round chain is up to date
    if (this.prevRound && !this.prevRound.stats) {
      this.prevRound.calculateStats();
    }

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
        stats.sharePrice = (stats.preMoney - (stats.postMoney * this._roundOptionsPoolSpec.percent)) / numPriorShares;
      }


      // Now that we know the share price, figure out how much equity each investment bought
      let anyChanged = false;
      roundInvestments.forEach(function(investment) {
        anyChanged = this._calculateInvestmentEquity(stats, investment) || anyChanged;
      }.bind(this));

      // Also recalculate the options pool using share price
      anyChanged = this._calculateOptionsPoolFromSharePrice(stats) || anyChanged;

      if (anyChanged) {
        stakes = this.getAllStakes();
        roundStakes = null; // possibly dirty, don't use
        stats.numSharesPostMoney = stakes.reduce(STAKES_TO_NUM_SHARES_REDUCER, 0);
      }

    // If no investments this round (eg founding round)...
    } else {

      let anyChanged = false;

      // Calculate option pool based on percentage
      anyChanged = this._calculateOptionsPoolFromPercentage();

      if (anyChanged) {
        stakes = this.getAllStakes();
        roundStakes = null; // possibly dirty, don't use
        stats.numSharesPostMoney = stakes.reduce(STAKES_TO_NUM_SHARES_REDUCER, 0);
      }
    }


    // Finally, calculate percentages
    stats.stakesAndPercentages = _.sortBy(stakes, 'id').reverse().map(
      stake => ({stake: stake, percentage: stake.numShares / stats.numSharesPostMoney})
    );

    // memoize indicating up-to-date
    this.stats = stats;

    // tell later Rounds that we've changed
    this.emit(EVENT_STATS_CHANGED, this);

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
    if (!roundStats.sharePrice || roundStats.sharePrice <= 0)
      throw new Error('Cannot make investment with 0 or negative share price');

    var numShares = investment.money / roundStats.sharePrice;

    var stakeChanged = false;

    var stake = investment.equityStake;
    if (!stake) {
      stake = new EquityStake(this, numShares, {shareClass: ShareClass.PREFERRED, fromInvestment: investment});
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

  /**
   * Calculates how much equity has been allocated to the option pool for this round
   *
   * If equity is not yet known, it is created and registered with the entities
   *
   * @param {Object} roundStats Object like:
   *   .sharePrice: {number} Cost per share
   * @return {boolean} True if the equity has changed, false otherwise
   */
  _calculateOptionsPoolFromSharePrice(roundStats) {
    if (!roundStats.sharePrice || roundStats.sharePrice <= 0)
      throw new Error('Cannot make investment with 0 or negative share price');

    if (this._roundOptionsPoolSpec.type !== 'post')
      throw new Error('pre-round option pool spec not supported');

    var numShares = roundStats.postMoney * this._roundOptionsPoolSpec.percent / roundStats.sharePrice;

    var stakeChanged = false;
    if (!this.roundOptionsPoolEquity) {
      this.roundOptionsPoolEquity = new EquityStake(this, numShares,
        {shareClass: ShareClass.COMMON, isOptionsPool: true}
      );
      stakeChanged = true;

    } else {
      if (numShares !== this.roundOptionsPoolEquity.numShares) {
        this.roundOptionsPoolEquity.numShares = numShares;
        stakeChanged = true;
      }
    }

    return stakeChanged;
  }

  /**
   * Calculates how much equity has been allocated to the option pool for this round based on just the round option
   * pool spec (percentage of round to options pool)
   *
   * If equity is not yet known, it is created and registered with the entities
   *
   * @return {boolean} True if the equity has changed, false otherwise
   */
  _calculateOptionsPoolFromPercentage() {
    if (this._roundOptionsPoolSpec.type !== 'post')
      throw new Error('pre-round option pool spec not supported');

    var stakes = this.getAllStakes();

    if (this.roundOptionsPoolEquity) {
      stakes = stakes.filter(s => s !== this.roundOptionsPoolEquity);
    }

    var nNonRoundOptionShares = stakes.reduce(STAKES_TO_NUM_SHARES_REDUCER, 0);

    // %PostMoneyOptShares = nPostMOptShares / ( nPreMoneyShares + nRoundShares + nPostMOptShares)
    // Re-arrange to solve for nPostMOptShares and you get:
    var nPostMoneyOptShares =
      ( this._roundOptionsPoolSpec.percent * nNonRoundOptionShares ) / (1 - this._roundOptionsPoolSpec.percent);

    var stakeChanged = false;
    if (!this.roundOptionsPoolEquity) {
      this.roundOptionsPoolEquity = new EquityStake(
        this, nPostMoneyOptShares, {shareClass: ShareClass.COMMON, isOptionsPool: true}
      );
      stakeChanged = true;

    } else {
      if (nPostMoneyOptShares !== this.roundOptionsPoolEquity.numShares) {
        this.roundOptionsPoolEquity.numShares = nPostMoneyOptShares;
        stakeChanged = true;
      }

    }

    return stakeChanged;
  }


};
