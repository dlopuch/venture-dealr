var _ = require('lodash');
var Reflux = require('reflux');
var actions = require('actions/actionsEnum.js');


var state = {
  hidePVScatter: true,
  hideRoundHighlights: true
};

module.exports = Reflux.createStore({

  init: function() {
    this.listenTo(actions.ui.showPVScatter, this._onShowPVScatter);
    this.listenTo(actions.ui.hideSelectRound, this._onHideSelectRound);
  },

  _onShowPVScatter: function(show) {
    state.hidePVScatter = !show;

    this.trigger(state);
  },

  _onHideSelectRound: function(hide) {
    state.hideRoundHighlights = !!hide;

    this.trigger(state);
  }

});

module.exports.INITIAL_STATE = _.cloneDeep(state);
