var _ = require('lodash');

var ACTIONS = {
  ROUND: {
    /** Indicates a new 'Latest Round' is present, indicating a new chain of rounds is ready */
    SET_SCENARIO: true,

    ADD_INVESTMENT: true,

    /** Indicates the round money has changed (valuation or investments) */
    UPDATED_MONEY: true,

    CHANGE_ROUND_PRE_MONEY_VALUATION: true,
  },

  INVESTMENT: {
    CHANGE_MONEY: true
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
