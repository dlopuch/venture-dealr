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
    actions.ui.showPVScatter(false);
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
        </p>

        <div className="panel panel-info side-note">
          <div className="panel-body">
            <p>
            Common stock is generally granted to employees in the form of <strong>options</strong>. An option is merely
            a contract giving the right to purchase shares at a specified price, specifically the price of a share at
            the last valuation event before the option was granted.  This is called the <strong>strike price</strong>,
            or the cost to <strong>exercise the options</strong>.
            </p>

            <p>
            For example, an early employee may have options granting her the ability to purchase shares at the Seed
            round valuation price.  If the options are worth more (eg because of a liquidation event or exit), the
            difference between the current value and strike prices is the employee's profit.
            </p>
          </div>
        </div>

        <p>
          Like investor shares, options pool shares are created out of thin air. They too contribute to dilution by
          increasing the size of the pie.  In this visualization, they will be shown as shades of grey.
        </p>

        <div className="panel panel-info side-note">
          <div className="panel-body">
            Options pools can be confusing. Although they are generally counted as part of your
            total <span className="highlight-round-valuation">pre-money</span>, they are often specified as a percentage of the
            post-round financing.  This practice has been called <a href="http://venturehacks.com/articles/option-pool-shuffle" target="blank">the
            Options Pool Shuffle</a> and can be a source of unexpected dilution.
          </div>
        </div>
        <p>
          Investor shares and option pools dilute every round.  However, next we will see that <strong>as long as the
          pie keeps getting bigger, dilution is not a bad thing.</strong>
        </p>
      </div>
    );
  }
});