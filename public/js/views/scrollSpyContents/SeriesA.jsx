var _ = require('lodash');
var React = require('react');
var Reflux = require('reflux');

var storyScenarios = require('models/storyScenarios');

var ScrollSpyContentsMixin = require('views/scrollSpy/ScrollSpyContentsMixin');

var SCROLLSPY_PROPS = {
  id: 'scenario-series-a',
  name: 'Series A'
}

module.exports = React.createClass({
  mixins: [ScrollSpyContentsMixin],

  getInitialState() {
    return {
      scrollSpy: SCROLLSPY_PROPS
    };
  },

  onScrollSpyFocus: function(target) {
    actions.ui.showPVScatter(true);
    actions.chart.showFirstRoundLabels(false);
    actions.chart.selectMeasure('values');
    actions.round.setScenario(storyScenarios.rounds.seriesA);
    actions.chart.selectRound(storyScenarios.rounds.seriesA);
  },

  render() {
    return (
      <div id={SCROLLSPY_PROPS.id}>
        <h1 className={this.state.scrollSpy.isFocused ? 'focus' : ''}>Series A: On To Something</h1>
        <p>
          18 months have gone by and you've executed well enough to get additional investors to put in
          another <span className="highlight-round-money"><strong>$ 5M</strong></span>.  Awesome!
        </p>
      </div>
    );
  }
});