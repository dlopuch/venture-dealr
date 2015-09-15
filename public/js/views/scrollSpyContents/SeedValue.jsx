var _ = require('lodash');
var React = require('react');
var Reflux = require('reflux');

var ScrollSpyContentsMixin = require('views/scrollSpy/ScrollSpyContentsMixin');

var SCROLLSPY_PROPS = {
  id: 'scenario-seed-value',
  name: 'Investors Assign Value'
}

module.exports = React.createClass({
  mixins: [ScrollSpyContentsMixin],

  getInitialState() {
    return {
      scrollSpy: SCROLLSPY_PROPS
    };
  },

  onScrollSpyFocus: function(target) {
    actions.chart.selectMeasure('values');
    actions.round.setScenario(window.scenario.seedRound);
  },

  render() {
    return (
      <div id={SCROLLSPY_PROPS.id}>
        <h1 className={this.state.scrollSpy.isFocused ? 'focus' : ''}>...but Assign Value</h1>
        <p>Instead of looking at percentage, we can look at the <strong>value</strong> of your equity.</p>
        <p>Note that your company had no value until your first valuation event.  In percentage terms you were diluted,
          but in value terms you have something instead of nothing!</p>
      </div>
    );
  }
});