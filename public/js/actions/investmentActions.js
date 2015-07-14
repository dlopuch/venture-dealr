var ACTIONS = require('./actionsEnum');
var dispatcher = require('dispatcher');

module.exports = {

  changeMoney: function(investment, newMoney) {
    dispatcher.dispatch(ACTIONS.INVESTMENT.CHANGE_MONEY, {investment: investment, money: newMoney});
  }
};
