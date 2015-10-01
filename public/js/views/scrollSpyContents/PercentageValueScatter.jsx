var _ = require('lodash');
var React = require('react');
var Reflux = require('reflux');

var storyScenarios = require('models/storyScenarios');

var ScrollSpyContentsMixin = require('views/scrollSpy/ScrollSpyContentsMixin');

var SCROLLSPY_PROPS = {
  id: 'scenario-percentage-value-scatter',
  name: 'Visualize Percentage and Value'
}

module.exports = React.createClass({
  mixins: [
    ScrollSpyContentsMixin,
    Reflux.listenTo(actions.chart.selectMeasure, '_onSelectMeasure')
  ],

  getInitialState() {
    return {
      scrollSpy: SCROLLSPY_PROPS
    };
  },

  _onSelectMeasure: function(measure) {
    this.setState({
      lastMeasure: measure
    });
  },

  onScrollSpyFocus: function(target) {
    actions.ui.showPVScatter(true);
    actions.chart.showFirstRoundLabels(true);
    actions.round.setScenario(storyScenarios.rounds.seed);
    actions.chart.selectRound(storyScenarios.rounds.seed);
  },

  render() {
    return (
      <div id={SCROLLSPY_PROPS.id}>
        <h2 className={this.state.scrollSpy.isFocused ? 'focus' : ''}>Percentage or Value?</h2>
        <p>
          Typically with each round, your percentage stake gets smaller (dilution).  The interesting questions, however,
          are how much smaller, and what happens to the value of your stake?
        </p>
        <p>
          Instead of switching between Percentage View and Value View, lets add a visualization that focuses on how
          the two quantities interact: introducing the Percentage-Value Scatterplot.
        </p>
        <p>
          Generally equity plots will go to the right and up -- stakes get diluted, but become more valuable.
          As we continue on our journey, take note of each equity stake's shape relative to the others. (<em>Do all stakes
          get diluted but more valuable?</em>) Interesting things start to happen once some plots begin to diverge.
        </p>
      </div>
    );
  }
});