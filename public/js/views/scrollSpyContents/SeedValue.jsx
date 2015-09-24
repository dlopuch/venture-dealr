var _ = require('lodash');
var React = require('react');
var Reflux = require('reflux');

var storyScenarios = require('models/storyScenarios');

var ScrollSpyContentsMixin = require('views/scrollSpy/ScrollSpyContentsMixin');

var SCROLLSPY_PROPS = {
  id: 'scenario-seed-value',
  name: 'Investors Assign Value'
}

module.exports = React.createClass({
  mixins: [
    ScrollSpyContentsMixin,
    Reflux.listenTo(actions.chart.selectMeasure, '_onSelectMeasure')
  ],

  getInitialState() {
    return {
      scrollSpy: SCROLLSPY_PROPS,
      lastMeasure: 'percentages'
    };
  },

  _onSelectMeasure: function(measure) {
    this.setState({
      lastMeasure: measure
    });
  },

  onScrollSpyFocus: function(target) {
    actions.chart.selectMeasure('values');
    actions.round.setScenario(storyScenarios.rounds.seed);
    actions.chart.selectRound(storyScenarios.rounds.seed);
  },

  switchToPercentage() {
    actions.chart.selectMeasure('percentages');
  },

  switchToValue() {
    actions.chart.selectMeasure('values');
  },

  render() {
    return (
      <div id={SCROLLSPY_PROPS.id}>
        <h1 className={this.state.scrollSpy.isFocused ? 'focus' : ''}>Investors Dilute but Assign Value</h1>
        <p>
          Instead of looking at <a onClick={this.switchToPercentage} className={'btn btn-xs ' + (this.state.lastMeasure === 'percentages' ? 'btn-primary' : 'btn-default')}>
            percentage
          </a> ownership, we can look
          at the <a onClick={this.switchToValue} className={'btn btn-xs ' + (this.state.lastMeasure === 'percentages' ? 'btn-default' : 'btn-primary')}>
            value
          </a> of your equity.
        </p>
        <p>
          Note that <strong>your company had no value until your first valuation event</strong>.  In <i>percentage</i> terms
          you were diluted, but in <i>value</i> terms you went from nothing to actual value! (At least on paper.)
        </p>
      </div>
    );
  }
});