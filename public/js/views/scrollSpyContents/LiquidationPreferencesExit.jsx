var _ = require('lodash');
var React = require('react');
var Reflux = require('reflux');

var Slider = require('bootstrap-slider');

var storyScenarios = require('models/storyScenarios');

var ChartStore = require('stores/ChartStore');
var ScrollSpyContentsMixin = require('views/scrollSpy/ScrollSpyContentsMixin');

var SCROLLSPY_PROPS = {
  id: 'scenario-liquidation-preferences-exit',
  name: 'Liquidation Preferences and Exits'
}

module.exports = React.createClass({
  mixins: [
    ScrollSpyContentsMixin,
    Reflux.listenTo(actions.exit.changeValuation, '_onChangeExitValuation')
  ],

  getInitialState() {
    return {
      scrollSpy: SCROLLSPY_PROPS
    };
  },

  _onChangeExitValuation: function(exit, value) {
    if (exit !== storyScenarios.rounds.exit)
      return; // then we don't care about it

    this.setState({
      sliderValue: value
    });
  },

  componentDidMount: function() {
    this._origExitValuation = storyScenarios.rounds.exit.valuation;

    this._slider = new Slider( React.findDOMNode(this.refs.roundSlider), {
      enabled: this.state.sliderEnabled,
      value: this.state.sliderValue,
      min: 10000000,
      max: 50000000,
      step: 100000,
      formatter: ChartStore.CURRENCY_FORMATTER
    })
    .on('change', this._onSliderChange);
  },

  onScrollSpyFocus: function(target) {
    this.setState({
      sliderEnabled: true
    });

    actions.ui.showPVScatter(true);
    actions.chart.setAxisLock();
    actions.chart.selectMeasure('values');
    actions.exit.changeValuation(storyScenarios.rounds.exit, 33000000);
    actions.round.setScenario(storyScenarios.rounds.exit);
  },

  _onSliderChange: function(sliderVals) {
    actions.exit.changeValuation(storyScenarios.rounds.exit, sliderVals.newValue, {throttle: true});
    actions.chart.selectRound(storyScenarios.rounds.exit);
  },

  onScrollSpyUnfocus: function(target) {
    this.setState({
      sliderEnabled: false
    });
  },

  render() {
    if (this._slider) {

      if (this.state.sliderEnabled) {
        this._slider.setValue( this.state.sliderValue, false, false );
        this._slider.enable();
      } else {
        this._slider.disable();
      }
    }

    return (
      <div id={SCROLLSPY_PROPS.id}>
        <h2 className={this.state.scrollSpy.isFocused ? 'focus' : ''}>Liquidation Preferences and the Empty-Handed Exit</h2>
        <p>
          But not all exits work out so well.
        </p>
        <p>
          Bringing new investors onboard in a round often works with
          a <strong>"Last-In-First-Out"</strong> model by granting them <strong>liquidation preferences</strong> &mdash; if
          the exit does not produce enough money to match the investments put in, the last investors in get their
          investment returned before anyone else gets anything.  Liquidation preferences reduce risk for later
          investors; later rounds tend to require higher amounts of capital, so reducing risk for those investors can
          help get them on board.  However, this comes at the expense of earlier investors and common-stock holders,
          who now require a far larger exit to get anything.
        </p>
        <div className="panel panel-info side-note">
          <div className="panel-body">
            Liquidation preferences can also come with multipliers.  A late-round investor with a 2x liquidation
            preference will get twice his investment out before other shareholders get anything.  This further reduces
            risk for later investors by guarenteeing them a profit (if there is a profit to be had by anyone).
          </div>
        </div>
        <p>
          If you're near the back, your shares may even be <strong>underwater</strong> &mdash; they may be worth less than
          the initial investment that created them.
        </p>
        <p>
          If you're at the very back (such as founder and employee <strong>common stock</strong> versus the
          investors' <strong>preferred stock</strong>), you may even walk away with nothing if there's not
          enough to satisfy the claims in front of you.
        </p>
        <p>
          Today is not a good day.  Adjust the exit valuation.  Which investors would want the company to take this exit
          opportunity today, and which investors might push to wait for another day?
        </p>
        <div>
          Exit valuation: <span ref='roundSlider'></span><br/>
        </div>
      </div>
    );
  }
});