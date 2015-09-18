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
        <h1 className={this.state.scrollSpy.isFocused ? 'focus' : ''}>To the Moon!</h1>
        <p>
          Thanks for tuning in.  Hope you learned something.
        </p>
        <p>
          Loved it? Hated it? Something broken? Would love to hear your
          feedback. <a href="https://twitter.com/floatrock" target="blank">@floatrock</a>.
        </p>
        <p>
          Found a bug?  <a href="https://github.com/dlopuch/venture-dealr/issues">File a bug</a>!
        </p>
      </div>
    );
  }
});