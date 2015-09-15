var _ = require('lodash');
var React = require('react');
var Reflux = require('reflux');

var ScrollSpyContentsMixin = require('views/scrollSpy/ScrollSpyContentsMixin');

var SCROLLSPY_PROPS = {
  id: 'scenario-liquidation-preferences-exit',
  name: 'Liquidation Preferences and Exits'
}

module.exports = React.createClass({
  mixins: [ScrollSpyContentsMixin],

  getInitialState() {
    return {
      scrollSpy: SCROLLSPY_PROPS
    };
  },

  onScrollSpyFocus: function(target) {
    actions.round.setScenario(window.exit);
    actions.exit.changeValuation(window.exit, 31000000);
  },

  render() {
    return (
      <div id={SCROLLSPY_PROPS.id}>
        <h2 className={this.state.scrollSpy.isFocused ? 'focus' : ''}>Liquidation Preferences and the Empty-Handed Exit</h2>
        <p>Liquidation preferences reduce risk for later investors at the expense of earlier investors and common-stock holders.</p>
        <p>
          Investors with seniority get their money out first, and only if there's anything left do others get a piece.
          If you're near the back, your claim may even be <strong>underwater</strong> -- it may be worth less than you
          initially put in.
        </p>
        <p>
          If you're in the back of the line (such as common stock), you may even walk away with nothing if there's not
          enough to satisfy the claims in front of you.
        </p>
      </div>
    );
  }
});