var _ = require('lodash');

exports.E = {
  SCROLL_SPY: {
    ID: 'Scroll Spy',

    // actions:
    SCENARIO_TRIGGERED: 'Scenario Triggered',
    SCENARIO_DURATION: 'Scenario Duration'
  },
  ROUND_CHART_BUTTON: {
    ID: 'Round Chart View Toggle',

    // actions:
    PERCENTAGE_VIEW: 'Percentage View',
    VALUE_VIEW: 'Value View'

    // labels are to be the scenario triggering them
  },
  SLIDER: {
    ID: 'Slider',

    // actions
    SLIDE_STOP: 'Slide Stop'

    // labels are to be the slider identity
  }
};

exports.event = function(category, action, label, value, meta) {
  window.ga('send', 'event', category, action, label, value, meta);

  window.mixpanel.track(
    (category || '') + ' - ' + (action || ''),
    _.merge({
      label: label,
      value: value,
    }, (meta || {}))
  );
};