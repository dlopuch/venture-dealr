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
    actions.round.setScenario(storyScenarios.rounds.seed);
    storyScenarios.actions.makeSeedHaveOptions();
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
          You will need additional talent to grow your venture, and this talent will want equity in your risky venture.
          But where does this equity come from?
        </p>
        <p>
          Every round you create another bucket of new shares reserved for employee stock grants.
          This bucket of equity is called an <span className="highlight-round-options"><strong>options pool</strong></span>.
          Options pools are another contributor of dilution &mdash; they also increase the size of the pie.  In this
          visualization, they will be shown as shades of grey.
        </p>

        <div className="panel panel-info side-note">
          <div className="panel-body">
            Options pools can be confusing. Although they are generally counted as part of your
            total <span className="highlight-round-valuation">pre-money</span>, they are specified as a percentage of the
            post-round financing.  This practice has been called <a href="http://venturehacks.com/articles/option-pool-shuffle" target="blank">the
            Options Pool Shuffle</a> and can be a source of unexpected dilution.
          </div>
        </div>
        <p>
          Next we will see that <strong>as long as the pie keeps getting bigger, dilution is not a bad thing.</strong>
        </p>
      </div>
    );
  }
});