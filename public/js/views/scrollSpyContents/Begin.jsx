var React = require('react');
var Reflux = require('reflux');

var actions = require('actions/actionsEnum');
var storyScenarios = require('models/storyScenarios');

var ScrollSpyContentsMixin = require('views/scrollSpy/ScrollSpyContentsMixin');

var SCROLLSPY_PROPS = {
  id: 'scenario-begin',
  name: 'Lets Begin'
}

module.exports = React.createClass({
  mixins: [
    ScrollSpyContentsMixin,
  ],

  onScrollSpyFocus: function(target) {
    actions.chart.selectMeasure('values');
    actions.round.setScenario(storyScenarios.rounds.demoExit);
    actions.chart.selectRound(null);
  },

  getInitialState() {
    return {
      scrollSpy: SCROLLSPY_PROPS
    };
  },

  render() {
    return (
      <div id={SCROLLSPY_PROPS.id}>
        <h1 className={this.state.scrollSpy.isFocused ? 'focus' : ''}>Lets Learn Venture Capital Finance!</h1>
        <p>
          Scroll down to begin.
        </p>
      </div>
    );
  }
});