var ACTIONS = require('./actionsEnum');
var dispatcher = require('dispatcher');

module.exports = {
  newRoundData: function(data) {
    dispatcher.dispatch(ACTIONS.CHART.NEW_ROUND_DATA, {data: data});
  },
};
