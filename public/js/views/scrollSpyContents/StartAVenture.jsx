var React = require('react');
var Reflux = require('reflux');
var actions = require('actions/actionsEnum');

var ScrollSpyContentsMixin = require('views/scrollSpy/ScrollSpyContentsMixin');

var SCROLLSPY_PROPS = {
  id: 'scenario-start-a-venture',
  name: 'Start a Venture'
}

module.exports = React.createClass({
  mixins: [
    ScrollSpyContentsMixin,
    //Reflux.listenTo(actions.scrollSpy.targetTriggered, '_onTargetTriggered')
  ],

  onScrollSpyFocus: function(target) {
    actions.chart.selectMeasure('percentages');
    actions.round.setScenario(window.scenario.foundingRound);
  },

  getInitialState() {
    return {
      scrollSpy: SCROLLSPY_PROPS
    };
  },

  render() {
    return (
      <div id={SCROLLSPY_PROPS.id}>
        <h1 className={this.state.scrollSpy.isFocused ? 'focus' : ''}>Lets start a venture</h1>
        <p>lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum </p>
      </div>
    );
  }
});