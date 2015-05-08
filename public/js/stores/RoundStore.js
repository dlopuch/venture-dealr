var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;

var dispatcher = require('../dispatcher');
var ACTIONS = require('../actions/actionsEnum');


var RoundStore = assign({}, EventEmitter.prototype, {
  dispatchToken: dispatcher.register(function(payload) {
    switch(payload.action) {
      case ACTIONS.ROUND.ADD_PREFERRED:
        RoundStore.emit('change', payload);
        break;
    }
  })
});



module.exports = RoundStore;
