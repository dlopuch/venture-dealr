var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;

var Round = require('./Round');

var id = 10000;

function SNP_TO_NUM_SHARES_REDUCER(sum, snp) {
  return sum + snp.stake.numShares;
}

/**
 * Reducer that reduces a bunch of stakeAndPercentages into the liquidation-preference-adjusted amount for each claim
 * @param {number} sum cumulative sum
 * @param {Object} snp a stakeAndPercentage
 */
function LIQUIDATION_PREFERENCE_REDUCER(sum, snp) {
  return sum + stakeToLiquidationPreference(snp.stake);
}

function stakeToLiquidationPreference(stake) {
  if (!stake.investment)
    return 0;

  return stake.liquidationPreference * stake.investment.money;
}

function stakeToBreakevenValue(stake) {
  if (stake.investment)
    return stakeToLiquidationPreference(stake);

  else
    return stake.numShares * stake.round.stats.sharePrice;
}


module.exports = class Exit extends EventEmitter {
  constructor(prevRound, valuation) {
    super();

    this.id = id++;

    this.prevRound = prevRound;
    this.valuation = valuation;

    this._handlePrevRoundChange = this._handlePrevRoundChange.bind(this);

    this.sequenceI = prevRound ? prevRound.sequenceI + 1 : 0;

    this.name = 'Exit';
  }

  set prevRound(prevRound) {
    if (!prevRound || !(prevRound instanceof Round))
      throw new Error('invalid prevRound');

    if (this._prevRound) {
      this._prevRound.removeListener(this._handlePrevRoundChange);
    }

    this._prevRound = prevRound;

    prevRound.on(Round.EVENT_STATS_CHANGED, this._handlePrevRoundChange.bind(this));
  }
  get prevRound() { return this._prevRound; }

  set valuation(valuation) {
    if (!_.isNumber(valuation) || valuation < 0)
      throw new Error('invalid valuation');

    this._valuation = valuation;
    this.stats = null;
  }
  get valuation() { return this._valuation; }

  _handlePrevRoundChange() {
    // If a previous round changed its stats, invalidate this Exit's changed stats
    this.stats = null;
  }

  getAllStakes(opts) {
    return this.prevRound.getAllStakes(opts);
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


    // On an exit, the valuation is split between the equities based on percentage ownership.
    var lastStakesAndPercentages = this.prevRound.stats.stakesAndPercentages;

    // ...but we need to figure out preferred owners' claims based on liquidation preference and seniority (traunche)
    var traunches = _(lastStakesAndPercentages)
      .groupBy(s => s.stake.liquidationSeniority || 'none')
      .map(function mapToTraunche(snps, key) {
        var seniority = parseInt(key, 10) || -Infinity;
        snps.forEach(snp => snp.stake.exitTraunche = seniority);
        return {
          seniority: seniority,
          stakesAndPercentages: snps
        };
      })

      // most senior traunches get paid out first
      .sortBy(traunche => -1 * traunche.seniority)

      // calculate stats for each traunche
      .forEach(function(claimTraunche) {
        // Sum of each stake's value * liquidation preference
        claimTraunche.liquidationPreferenceClaim =
          claimTraunche.stakesAndPercentages.reduce(LIQUIDATION_PREFERENCE_REDUCER, 0);

        // Total shares in traunche (for partial splits)
        claimTraunche.numShares = claimTraunche.stakesAndPercentages.reduce(SNP_TO_NUM_SHARES_REDUCER, 0);
      })
      .value();

    var payoutsByEquityStake = _(lastStakesAndPercentages)
      .map(snp => ({
        stakeAndPercentage: snp,
        breakevenValue: stakeToBreakevenValue(snp.stake),
        payout: 0
      }))
      .indexBy('stakeAndPercentage.stake.id')
      .value();


    // Now start paying out.  First payout the liquidation preferences
    var t = 0;
    var remainingCash = this.valuation;
    while (remainingCash > 0 && traunches[t]) {
      var traunche = traunches[t++];

      // If there's more money than claims, everyone gets their claim out.  Otherwise, traunche claims get discounted.
      var discount = Math.min(1, remainingCash / traunche.liquidationPreferenceClaim);

      /* jshint loopfunc:true */
      traunche.stakesAndPercentages.forEach(function(snp) {
        var payout = stakeToLiquidationPreference(snp.stake) * discount;
        payoutsByEquityStake[snp.stake.id].payout += payout;
        remainingCash -= payout;
      });
      /* jshint loopfunc:false */
    }

    var stakesAndPayouts = _.values(payoutsByEquityStake);


    // Liquidation preferences satisfied.  Any remaining payouts now go by percentage ownership in the last round
    if (remainingCash > 0) {
      stakesAndPayouts.forEach(function(payoutStat) {
        payoutStat.payout += remainingCash * payoutStat.stakeAndPercentage.percentage;
      });
    }


    // Money has been disbursed.  Now lets do some post-processing.
    var self = this;
    stakesAndPayouts.forEach(function(payoutStat) {

      payoutStat.roi = payoutStat.payout / payoutStat.breakevenValue;

      payoutStat.stake = payoutStat.stakeAndPercentage.stake;

      // Liquidation preferences are interesting because they amplify percentage stake, even when everyone gets paid.
      // Take a looksie.
      payoutStat.percentage = payoutStat.payout / self.valuation;

      // For value stack, we want to show either the payout or what the payout needs to be.  So take the greater-of.
      payoutStat.value = Math.max(payoutStat.payout, payoutStat.breakevenValue);

      payoutStat.isUnderwater = payoutStat.payout < payoutStat.breakevenValue;
    });


    this.stats = {
      // This one needs to be series order to make chart series generation work
      stakesAndPayouts: stakesAndPayouts,

      // This ordering should be the order in which the stack appears
      orderedStakesAndPayouts: _.sortBy(stakesAndPayouts, snp => -1 * snp.stake.exitTraunche).reverse()
    };


    return this.stats;
  }




};

