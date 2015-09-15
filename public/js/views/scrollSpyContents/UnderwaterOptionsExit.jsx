var _ = require('lodash');
var React = require('react');
var Reflux = require('reflux');

var ScrollSpyContentsMixin = require('views/scrollSpy/ScrollSpyContentsMixin');

var SCROLLSPY_PROPS = {
  id: 'scenario-underwater-options-exit',
  name: 'Underwater Options and Exits'
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
    actions.exit.changeValuation(window.exit, 60000000);
  },

  render() {
    return (
      <div id={SCROLLSPY_PROPS.id}>
        <h2 className={this.state.scrollSpy.isFocused ? 'focus' : ''}>Underwater Options: A Positive Exit With Nothing</h2>
        <p>Even a positive exit can still leave you with nothing.</p>
        <p>
          Because the exit amount is subject to preferences, this pie is not split evenly.  Some investors may make their
          money back (plus an extra profit), but the extra profit may not be enough to match the value of common-stock
          holders.
        </p>
        <p>
          In fact, if the common stock is in the form of options, <strong>the holder would have to pay more than their
          stakes were worth</strong> in order to exercise the options.  The holder would instead just walk away
          with nothing.
        </p>
      </div>
    );
  }
});