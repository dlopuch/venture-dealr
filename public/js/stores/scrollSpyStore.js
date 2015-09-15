/**
 * Works with ScrollSpy.jsx to cludge bootstrap's nav-driven scrollspy into generic reflux actions.
 *
 * When a ScrollSpy.jsx is mounted, this fires off all the jquery plugins needed to make it work.
 * When stuff scrolls into view, fires off the `actions.scrollSpy.targetTriggered()` action.
 *
 * Add targets to the scroll spy (when they're mounted) via `actions.scrollSpy.registerTarget()`.
 *
 * NOTES:
 *   - Only one scrollspy can be active (bootstrap limitation)
 *   - We spy against body.  See CSS, but the html tag seems to need a height:100% css rule to make it work.
 */

var _ = require('lodash');
var Reflux = require('reflux');
// assumes bootstrap js and it's jquery plugins have been loaded

var actions = require('actions/actionsEnum.js');


var OFFSET = $('#charts-container').height() + 200;

var wasMounted = false;

var state = {
  spyTargets: []
};

module.exports = Reflux.createStore({
  init: function() {
    this.listenTo(actions.scrollSpy.mounted, this._onMounted);
    this.listenTo(actions.scrollSpy.refreshed, this._onRefreshed);
    this.listenTo(actions.scrollSpy.registerTarget, this._onRegisterTarget);
  },

  _onMounted: function(domId) {
    if (wasMounted)
      throw new Error('We currently support only one scrollspy right now');

    wasMounted = true;

    $('body').scrollspy({
      target: '#' + domId,
      offset: OFFSET
    })
    .on('activate.bs.scrollspy', this._onActivateTarget);
    this.trigger(state);
  },

  _onActivateTarget: function(event) {
    var scenario = $(event.target).find('> a').attr('href');

    if (!scenario)
      throw new Error('Couldnt find scenario on scrollspy activation!');

    actions.scrollSpy.targetTriggered(
      scenario.substring(1) // bootstrap needs this to be '#target-id'.  We want to lose the #
    );
  },

  _onRefreshed: function(domId) {
    $('body').scrollspy('refresh');
  },

  _onRegisterTarget: function(domId, name) {
    state.spyTargets.push({
      id: domId,
      name: name
    });
    this.trigger(state);
  }
});