var _ = require('lodash');
var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;

var dispatcher = require('dispatcher');
var ACTIONS = require('actions/actionsEnum');
var roundActions = require('actions/roundActions');


var RoundStore = assign({}, EventEmitter.prototype, {

  handleAddEquityStake: function(payload) {
    var round = payload.round;
    round.addStake(payload.stake);
  },

  handleAddInvestment: function(payload) {
    var round = payload.round;
    round.addInvestment(payload.investment);
    setTimeout(_.partial(roundActions.updatedMoney, payload.round));
  },

  generateChartSeries: function(upToRound) {
    var percentagesByStakeIds = {};
    var valuesByStakeIds = {};

    // Make all the rounds calculate stats and memoize (calculateStats() forces earlier rounds to recalculate if dirty)
    var stats = upToRound.calculateStats();

    // We assume stakes are never sold -- once it exists, it exists on all subsequent rounds.  The final round,
    // upToRound, therefore contains all the equity stakes.  We will start with them, then work our way backwards
    // through the rounds creating same-length timelines of each stake.
    var stakeDataById = _(stats.stakesAndPercentages)
    .map(function(snp) {
      return {
        stake: snp.stake,

        // by-round numbers will go here
        percentages: [],
        values: []
      };
    })
    .indexBy('stake.id')
    .value();

    // the x-axis
    var roundData = [];

    var allStakesIdx = _(stats.stakesAndPercentages).pluck('stake').indexBy('id').value();

    var round = upToRound;
    while (round) {
      stats = round.calculateStats();

      roundData.push({
        round: round,
        stats: stats
      });

      // Each round has a bunch of stakes (previous rounds have fewer and fewer).
      // Process the round's stakes, then any that are left-over add nulls for all the timelines so that all timelines
      // are the same length

      var allStakes = _.clone(allStakesIdx);

      /* jshint loopfunc:true */
      stats.stakesAndPercentages.forEach(function(snp) {
        stakeDataById[snp.stake.id].percentages.push( snp.percentage );
        stakeDataById[snp.stake.id].values.push( stats.sharePrice * snp.stake.numShares );
        delete allStakes[snp.stake.id];
      });

      // now process all unused stakes
      _.values(allStakes).forEach(function(stake) {
        stakeDataById[stake.id].percentages.push(null);
        stakeDataById[stake.id].values.push(null);
      });
      /* jshint loopfunc:false */

      round = round.prevRound;
    }

    return {
      // the x-axis
      rounds: roundData.reverse(), // correct for 'backwards' iteration-from-last-round

      // list of stake containers, where each holds to the underlying stake and lists of measures
      // (ie stakes[i].percentages and stakes[i].values)
      stakes: _(stakeDataById)
        .values()
        .forEach(function(s) {
          s.percentages.reverse();
          s.values.reverse();
        })
        .value()
    };
  },

  dispatchToken: dispatcher.register(function(payload) {
    switch (payload.action) {
      case ACTIONS.ROUND.ADD_INVESTMENT:
        RoundStore.handleAddInvestment(payload);
        break;

      case ACTIONS.ROUND.UPDATED_MONEY:
        window.round = payload.round;
        console.log('Round money updated!', payload.round);
    }
  })
});



module.exports = RoundStore;
