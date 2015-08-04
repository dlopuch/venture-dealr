/**
 * Flux data store to handle data model business logic in response to various flux actions.
 *
 * Is a EventEmitter.  See EVENTS for how components should be notified of new data.
 */

var _ = require('lodash');
var Reflux = require('reflux');

var actions = require('actions/actionsEnum');
var Exit = require('models/Exit');
var Round = require('models/Round');


var latestRound;


module.exports = Reflux.createStore({

  init: function() {
    this.listenToMany({
      'setScenario': actions.round.setScenario,
      'changeRoundPreMoneyValuation': actions.round.changeRoundPreMoneyValuation,
      'addInvestment': actions.round.addInvestment,
      'updatedMoney': actions.round.updatedMoney,
      'changeMoney': actions.investment.changeMoney
    });
  },

  onSetScenario: function(round) {
    latestRound = round;
    this.chartNewData();
  },

  onAddInvestment: function(round, investment) {
    round.addInvestment(investment);
    actions.round.updatedMoney(round);
  },

  onChangeRoundPreMoneyValuation: function(round, newValuation) {
    round.preMoneyValuation = newValuation;
    actions.round.updatedMoney(round);
  },

  onUpdatedMoney: function(round) {
    this.chartNewData();
  },

  // actions.investment.changeMoney
  onChangeMoney: function(investment, newMoney) {
    investment.money = newMoney;
    investment.round.stats = null;
    actions.round.updatedMoney(investment.round);
  },

  /**
   * Given a round, generates chart series data for everything up to the round
   */
  chartNewData: function() {
    actions.round.newRoundData( this._generateChartSeries( latestRound ) );
  },

  /**
   * Turns a round into a data to be fed into a d3 stack layout.
   *
   * @param {models.Round | models.Exit} upToRound last round to data-ify
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
  _generateChartSeries: function(upToRound) {
    var isExit = upToRound instanceof Exit;

    if (!isExit && !(upToRound instanceof Round))
      throw new Error('cant generate chart series if not a Round nor an Exit');

    var percentagesByStakeIds = {};
    var valuesByStakeIds = {};

    // Make all the rounds calculate stats and memoize (calculateStats() forces earlier rounds to recalculate if dirty)
    var stats = upToRound.calculateStats();

    // We assume stakes are never sold -- once it exists, it exists on all subsequent rounds.  The final round,
    // upToRound, therefore contains all the equity stakes.  We will start with them, then work our way backwards
    // through the rounds creating same-length timelines of each stake.
    var stakeDataById = _(stats.stakesAndPercentages || stats.stakesAndPayouts)
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

    var allStakesIdx = _(stats.stakesAndPercentages || stats.stakesAndPayouts).pluck('stake').indexBy('id').value();

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
      (stats.stakesAndPercentages || stats.stakesAndPayouts).forEach(function(snp) {
        stakeDataById[snp.stake.id].percentages.push( snp.percentage );
        stakeDataById[snp.stake.id].values.push(
          isExit ?
            snp.value :
            stats.sharePrice * snp.stake.numShares
        );
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
              x: roundData[i].round.id,
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
  }
});
