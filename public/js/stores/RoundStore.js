var _ = require('lodash');
var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;

var dispatcher = require('app/dispatcher');
var ACTIONS = require('app/actions/actionsEnum');
var roundActions = require('app/actions/roundActions');


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
