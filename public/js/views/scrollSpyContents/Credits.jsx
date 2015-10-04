var _ = require('lodash');
var React = require('react');
var Reflux = require('reflux');

var storyScenarios = require('models/storyScenarios');

var ScrollSpyContentsMixin = require('views/scrollSpy/ScrollSpyContentsMixin');

var SCROLLSPY_PROPS = {
  id: 'scenario-credits',
  name: 'Credits'
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
    actions.exit.changeValuation(storyScenarios.rounds.exit, 1000000000);
    actions.round.setScenario(storyScenarios.rounds.exit);
    actions.chart.selectRound(null);
  },

  render() {
    return (
      <div id={SCROLLSPY_PROPS.id}>
        <h1 className={this.state.scrollSpy.isFocused ? 'focus' : ''}>Here's To the Moonshots!</h1>
        <p>
          Thanks for tuning in. There are many more topics to cover beyond this introduction: debt and debt discounts,
          tax implications of exercising options, valuation triggers, and many more.
        </p>
        <p>
          Want more detail on a specific topic?  Was something confusing or not completely accurate?  Want to just give
          some love? <a href="https://twitter.com/floatrock" target="blank">@floatrock</a>.
        </p>
        <p>
          Coming soon: <strong>Venture Makr!</strong> Create your own deal structures with your own numbers and see
          how turning the knobs changes the output.  <a href="https://twitter.com/floatrock" target="blank">Follow
          me</a> to stay updated.
        </p>
        <p>
          Found a bug?  <a href="https://github.com/dlopuch/venture-dealr/issues">File a bug</a>!
        </p>
      </div>
    );
  }
});