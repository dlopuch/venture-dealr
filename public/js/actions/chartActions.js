var ACTIONS = require('./actionsEnum');
var dispatcher = require('dispatcher');

module.exports = {
  selectMeasure: function(measureName) {
    dispatcher.dispatch(ACTIONS.CHART.SELECT_MEASURE, {measureName: measureName});
  },

  selectRound: function(round) {
    dispatcher.dispatch(ACTIONS.CHART.SELECT_ROUND, {round: round});
  }
};
