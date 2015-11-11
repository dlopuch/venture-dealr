var Reflux = require('reflux');

var actions = require('actions/actionsEnum');

var state = {
  lastHeader: null,
  newHeader: null
};

module.exports = Reflux.createStore({
  init: function () {
    this.listenToMany({
      'onNewDemoTitle': actions.demo.newDemoTitle
    });
  },

  onNewDemoTitle(title) {
    if (title === state.newHeader)
      return;

    state.lastHeader = state.newHeader;
    state.newHeader = title;
    this.trigger(state);
  }
});