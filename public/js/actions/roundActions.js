var ACTIONS = require('./actionsEnum');
var dispatcher = require('app/dispatcher');

module.exports = {
  addInvestment: function(round, investment) {
    dispatcher.dispatch(ACTIONS.ROUND.ADD_INVESTMENT, {round: round, investment: investment});
  },

  updatedMoney: function(round) {
    dispatcher.dispatch(ACTIONS.ROUND.UPDATED_MONEY, {round: round});
  }
};
