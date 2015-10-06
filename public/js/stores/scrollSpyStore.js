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
var analytics = require('analytics');


var OFFSET = 200;

var wasMounted = false;

var state = {
  spyTargets: []
};

var spyTargetsTriggered = {};

var doLogLastActivation;
var doLogLastActivationTimeout;

function queueLogScenarioActivation(scenario) {
  var firstTime = !spyTargetsTriggered[scenario];
  spyTargetsTriggered[scenario] = true;

  // Fire queued event from last scenario
  if (doLogLastActivation) {
    doLogLastActivation();
  }

  // Log that we triggered it
  analytics.event(analytics.E.SCROLL_SPY.ID, analytics.E.SCROLL_SPY.SCENARIO_TRIGGERED, scenario, firstTime ? 1 : 0);

  // But also queue up an event that will fire with how long we stayed on it when we visit the next scenario...

  var scenarioHitMs = Date.now();

  doLogLastActivation = function() {
    // cleanup
    doLogLastActivation = null;
    clearTimeout(doLogLastActivationTimeout);

    // log the previous event
    var timeSpentMs = Date.now() - scenarioHitMs;
    analytics.event(analytics.E.SCROLL_SPY.ID, analytics.E.SCROLL_SPY.SCENARIO_DURATION, scenario, timeSpentMs);

    // queue up a watchdog
    doLogLastActivationTimeout = setTimeout(doLogLastActivation, 6 * 60 * 1000);
  };
}

/** Stall the page exit until we fire off last queued ajax */
window.onbeforeunload = function(e) {
  if (doLogLastActivation) {
    doLogLastActivation();

    // do something unnoticable but time consuming like writing data to console to let final tracking go through
    // (real way is synchronous ajax (oxymoron...) but we can't control analytics libs)
    if (window.console && window.console.log) {
      for (var i=0; i<2000; i++) {
        window.console.log('just stallin you for a few ms while your browser shoots off some requests...');
      }
    }
  }
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
      offset: $('#charts-container').height() + OFFSET
    })
    .on('activate.bs.scrollspy', this._onActivateTarget);
    this.trigger(state);
  },

  _onActivateTarget: function(event) {
    var scenario = $(event.target).find('> a').attr('href');

    if (!scenario)
      throw new Error('Couldnt find scenario on scrollspy activation!');

    scenario = scenario.substring(1); // bootstrap makes this '#target-id'.  We want to lose the #

    queueLogScenarioActivation(scenario);

    actions.scrollSpy.targetTriggered(scenario);
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