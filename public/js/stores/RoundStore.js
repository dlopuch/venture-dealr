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

  /**
   * Turns a round into a data to be fed into a d3 stack layout.
   *
   *
   *
   * @param {models.Round} upToRound last round to data-ify
   * @returns {Object} like: {
   *   rounds: {Array(model.Round)} List of rounds in order, ie the x-axis
   *   stakes: {Array(Object)} where each object is like:
   *     stake: {models.EquityStake} Underlying stake for the series
   *     percentages: {Array(Object)} List of d3 stack layout objects for percentage measure
   *     values: {Array(Object)} List of d3 stack layout objects for value of equity shares measure
   *   }
   * }
   *
   * .percentages and .values are Objects like: {
   *   x: {number} index into .rounds
   *   n: {number} value of the measure (eg percentage if .percentages)
   *   xRound: {models.Round} the Round
   *   yStake: {models.EquityStake} the stake for the datum (same across entire series)
   * }
   *
   * To generate .y and .y0's, should be fed into a d3 layout like so:
   *   d3.layout.stack()
   *   .values(s => s.percentages)  [note: or .values, whichever measure you want]
   *   .y(o => o.n)
   */
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

          // correct for 'backwards' iteration-from-last-round
          s.percentages.reverse();
          s.values.reverse();

          // transform into d3 stack layout format, and for convenience link to all other entities
          function xyify(number, i) {
            return {
              x: i,
              n: number,

              xRound: roundData[i].round,
              xRoundStats: roundData[i].stats,
              yStake: s.stake

              // .y and .y0 added in by the stack layout
            };
          }
          s.percentages = s.percentages.map(xyify);
          s.values      = s.values.map(xyify);
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
