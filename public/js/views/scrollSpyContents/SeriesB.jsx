var _ = require('lodash');
var React = require('react');
var Reflux = require('reflux');

var storyScenarios = require('models/storyScenarios');

var ScrollSpyContentsMixin = require('views/scrollSpy/ScrollSpyContentsMixin');

var SCROLLSPY_PROPS = {
  id: 'scenario-series-b',
  name: 'Series B'
}

module.exports = React.createClass({
  mixins: [ScrollSpyContentsMixin],

  getInitialState() {
    return {
      scrollSpy: SCROLLSPY_PROPS
    };
  },

  onScrollSpyFocus: function(target) {
    actions.round.setScenario(storyScenarios.rounds.seriesB);
  },

  render() {
    return (
      <div id={SCROLLSPY_PROPS.id}>
        <h2 className={this.state.scrollSpy.isFocused ? 'focus' : ''}>Series B: Keep Growing the Pie</h2>
        <p>
          More months have gone by, and this time you got an additional <strong>$ 6M</strong>!
          You're making this look easy!
        </p>
      </div>
    );
  }
});