var _ = require('lodash');
var React = require('react');
var Reflux = require('reflux');

var ScrollSpyContentsMixin = require('views/scrollSpy/ScrollSpyContentsMixin');

var SCROLLSPY_PROPS = {
  id: 'scenario-seed-dilute',
  name: 'Investors Dilute'
}

module.exports = React.createClass({
  mixins: [ScrollSpyContentsMixin],

  onScrollSpyTriggered: function(target) {
    actions.chart.selectMeasure('percentages');
    actions.round.setScenario(window.scenario.seedRound);
  },

  getInitialState() {
    return {
      scrollSpy: SCROLLSPY_PROPS
    };
  },

  render() {
    return (
      <div id={SCROLLSPY_PROPS.id}>
        <h1>Investors Dilute</h1>
        <p>You've convinced investors to give you seed money.  Investment dilutes.</p>
        <p>
          Your investors assign a value to your company
          (the <span className="highlight-round-valuation"><strong>pre-money</strong></span>),
          and <span className="highlight-round-money">their percentage stake</span> is
          how much they put in relative to the pre-money valuation.
        </p>
        <p>
          However, you also created an <span className="highlight-round-options"><strong>options pool</strong></span> to
          allocate equity to new hires.  This is counted as part of the <span className="highlight-round-valuation">pre-money</span>.
        </p>
        <p>
          Both the investors' equity and the option pool's equity are new shares created out of nothing.  They increase
          the size of the pie, hence your existing shares are a smaller percentage.
        </p>
      </div>
    );
  }
});