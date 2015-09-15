var _ = require('lodash');
var React = require('react');
var Reflux = require('reflux');

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

  onScrollSpyTriggered: function(target) {
    actions.exit.changeValuation(window.exit, 95000000);
    actions.round.setScenario(window.exit);
  },

  render() {
    return (
      <div id={SCROLLSPY_PROPS.id}>
        <h1>The Exit (Success)</h1>
        <p>lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum </p>
      </div>
    );
  }
});