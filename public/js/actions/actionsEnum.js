var _ = require('lodash');
var Reflux = require('reflux');

module.exports = {
  scrollSpy: require('actions/scrollSpy'),

  'round': Reflux.createActions([
    /**
     * Indicates a round model has been converted into a new chart series
     * @param {Object} chartSeriesData
     */
    'newRoundData',

    /**
     * Indicates a new 'Latest Round' is present, indicating a new chain of rounds is ready (or an exit event)
     * @param {models.Round | models.Exit} round or exit
     */
    'setScenario',

    /**
     * Adds an investment to a round
     * @param {models.Round}
     * @param {models.Investment} The investment to add
     */
    'addInvestment',

    /**
     * Indicates the round money has changed (valuation or investments)
     * @param {models.Round | models.Exit} Updated round
     */
    'updatedMoney',

    /**
     * Update a round's pre-money valuation
     * @param {models.Round} Round to update
     * @param {number} New valuation
     */
    'changeRoundPreMoneyValuation',

    /**
     * Update a round's option pool spec
     * @param {models.Round} Round to update
     * @param {Object} newOptionsPoolSpec Object like:
     *   type: {'post'} Option pool shuffle: is rounds option pool specified pre-money or post-money
     *     (TODO: only post-money supported for now, always 'post')
     *   percent: {number} Number between 0 and 1.
     */
    'changeOptionsPoolSpec'
  ]),

  'exit': Reflux.createActions([
    /**
     * Changes the valuation of an Exit event
     * @param {models.Exit} Exit event
     * @param {number} New valuation
     */
    'changeValuation'
  ]),

  investment: Reflux.createActions([
    'changeMoney'
  ]),

  chart: Reflux.createActions([
    /**
     * Changes the active measure on the RoundChart
     * @param {string} The new active measure
     */
    'selectMeasure',

    /**
     * Changes the selected Round for drill-down views, etc
     * @param {models.Round} The new active Round to focus on
     */
    'selectRound'
  ])

};