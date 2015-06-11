var ACTIONS = require('./actionsEnum');
var dispatcher = require('dispatcher');

module.exports = {
  newRoundData: function(data) {
    dispatcher.dispatch(ACTIONS.CHART.NEW_ROUND_DATA, {data: data});
  },

  selectMeasure: function(measureName) {
    dispatcher.dispatch(ACTIONS.CHART.SELECT_MEASURE, {measureName: measureName});
  },
};
