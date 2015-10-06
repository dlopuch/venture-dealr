var _ = require('lodash');

exports.event = function(category, action, label, value, meta) {
  window.ga('send', 'event', category, action, label, value, meta);

  window.mixpanel.track(
    (category || '') + ' ' + (action || ''),
    _.merge({
      label: label,
      value: value,
    }, (meta || {}))
  );
};