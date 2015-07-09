var ACTIONS = require('./actionsEnum');
var dispatcher = require('dispatcher');

module.exports = {
  setScenario: function(round) {
    dispatcher.dispatch(ACTIONS.ROUND.SET_SCENARIO, {round: round});
  },

  addInvestment: function(round, investment) {
    dispatcher.dispatch(ACTIONS.ROUND.ADD_INVESTMENT, {round: round, investment: investment});
  },

  updatedMoney: function(round) {
    dispatcher.dispatch(ACTIONS.ROUND.UPDATED_MONEY, {round: round});
  },

  changeRoundPreMoneyValuation: function(round, newValuation) {
    dispatcher.dispatch(ACTIONS.ROUND.CHANGE_ROUND_PRE_MONEY_VALUATION, {round: round, newValuation: newValuation});
  }
};
