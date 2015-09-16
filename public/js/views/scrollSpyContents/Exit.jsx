var _ = require('lodash');
var React = require('react');
var Reflux = require('reflux');

var storyScenarios = require('models/storyScenarios');

var ScrollSpyContentsMixin = require('views/scrollSpy/ScrollSpyContentsMixin');

var SCROLLSPY_PROPS = {
  id: 'scenario-exit',
  name: 'Exit'
}

module.exports = React.createClass({
  mixins: [ScrollSpyContentsMixin],

  getInitialState() {
    return {
      scrollSpy: SCROLLSPY_PROPS
    };
  },

  componentDidMount: function() {
    this._origExitValuation = storyScenarios.rounds.exit.valuation;
  },

  onScrollSpyFocus: function(target) {
    actions.chart.selectMeasure('values');
    actions.exit.changeValuation(storyScenarios.rounds.exit, this._origExitValuation);
    actions.round.setScenario(storyScenarios.rounds.exit);
    actions.chart.selectRound(storyScenarios.rounds.exit);
  },

  render() {
    return (
      <div id={SCROLLSPY_PROPS.id}>
        <h1 className={this.state.scrollSpy.isFocused ? 'focus' : ''}>The (Successful) Exit</h1>
        <p>
          And now our journey is coming to an end.  Ideally it's a happy ending -- the buyout or IPO value is high
          enough that all shareholders get a positive return.  Pop the champagne!
        </p>
      </div>
    );
  }
});