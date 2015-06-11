var _ = require('lodash');

var ACTIONS = {
  ROUND: {
    SET_SCENARIO: true,
    ADD_INVESTMENT: true,
    UPDATED_MONEY: true,
  },

  CHART: {
    NEW_ROUND_DATA: true,
    SELECT_MEASURE: true
  }

};

(function buildActions(accKey, tree) {
  _.each(tree, function(value, nextKey) {
    if (_.isObject(value)) {
      buildActions(accKey + '.' + nextKey, value);
    } else {
      tree[nextKey] = accKey + '.' + nextKey;
    }
  });
})('ACTIONS', ACTIONS);

module.exports = ACTIONS;
