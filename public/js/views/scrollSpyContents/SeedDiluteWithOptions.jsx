var _ = require('lodash');
var React = require('react');
var Reflux = require('reflux');

var storyScenarios = require('models/storyScenarios');

var ScrollSpyContentsMixin = require('views/scrollSpy/ScrollSpyContentsMixin');

var SCROLLSPY_PROPS = {
  id: 'scenario-seed-dilute-with-options',
  name: 'Option Pools and Dilution'
}

module.exports = React.createClass({
  mixins: [ScrollSpyContentsMixin],

  onScrollSpyFocus: function() {
    actions.chart.selectMeasure('percentages');
    storyScenarios.actions.makeSeedHaveOptions();
    actions.round.setScenario(storyScenarios.rounds.seed);
  },

  getInitialState() {
    return {
      scrollSpy: SCROLLSPY_PROPS
    };
  },

  render() {
    return (
      <div id={SCROLLSPY_PROPS.id}>
        <h2 className={this.state.scrollSpy.isFocused ? 'focus' : ''}>Options Pools Necessarily Dilute Further</h2>
        <p>
          You will need additional talent to grow your venture, and often what you can't pay in salary you pay with
          equity.  But where does this equity come from?
        </p>
        <p>
          When you raise a round, the investors' shares are created out of thin air, but you also create shares reserved
          for employee stock grants.  This bucket of equity is called
          an <span className="highlight-round-options"><strong>options pool</strong></span>. Option pools are generally
          counted as part of your total <span className="highlight-round-valuation">pre-money</span> (hover over the
          seed round stack for details).
        </p>
        <p>
          Options pools are created
          at every round and are an important knob in the dilution calculations.  In this visualization, they will be
          shown as shades of grey.
        </p>
        <p>
          Both the investors' equity and the options pool's equity are new shares created out of nothing and added to
          the pie.
        </p>
        <p>
          Next we will see that <strong>as long as the pie keeps getting bigger, dilution is not a bad thing.</strong>
        </p>
      </div>
    );
  }
});