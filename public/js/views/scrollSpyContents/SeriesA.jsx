var _ = require('lodash');
var React = require('react');
var Reflux = require('reflux');

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

  onScrollSpyTriggered: function(target) {
    actions.round.setScenario(window.scenario.seriesARound);
  },

  render() {
    return (
      <div id={SCROLLSPY_PROPS.id}>
        <h1>Series A: On To Something</h1>
        <p>lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum </p>
      </div>
    );
  }
});