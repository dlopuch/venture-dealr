var _ = require('lodash');
var Dispatcher = require('flux').Dispatcher;

class ActioningDispatcher extends Dispatcher {
  constructor() {
    super();
  }

  dispatch(action, payload) {
    if (!action)
      throw new Error('No action specified!');

    super.dispatch(_.extend({action: action}, payload) );
  }
}

module.exports = new ActioningDispatcher();
