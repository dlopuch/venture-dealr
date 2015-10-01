var _ = require('lodash');
var Reflux = require('reflux');
var actions = require('actions/actionsEnum.js');


var state = {
  hidePVScatter: true
};

module.exports = Reflux.createStore({

  init: function() {
    this.listenTo(actions.ui.showPVScatter, this._onShowPVScatter);
  },

  _onShowPVScatter: function(show) {
    state.hidePVScatter = !show;

    this.trigger(state);
  }

});