var _ = require('lodash');
var React = require('react');
var Reflux = require('reflux');

var Slider = require('bootstrap-slider');

var analytics = require('analytics');
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

    var slideStartMs;
    var slideStartValue;

    this._slider = new Slider( React.findDOMNode(this.refs.roundSlider), {
      enabled: this.state.sliderEnabled,
      value: this.state.sliderValue,
      min: 10000000,
      max: 50000000,
      step: 100000,
      formatter: ChartStore.CURRENCY_FORMATTER
    })
    .on('change', this._onSliderChange)
    .on('slideStart', function(value) {
      slideStartMs = Date.now();
      slideStartValue = value;
    })
    .on('slideStop', function(slideEndValue) {
      analytics.event(
        analytics.E.SLIDER.ID,
        analytics.E.SLIDER.SLIDE_STOP,
        SCROLLSPY_PROPS.id,
        Date.now() - slideStartMs,
        {
          startValue: slideStartValue,
          endValue: slideEndValue
        }
      );
    });
  },

  onScrollSpyFocus: function(target) {
    this.setState({
      sliderEnabled: true
    });

    actions.ui.hideSelectRound(false);
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
          When a new financing round brings new investors onboard, they often come onboard with
          a <strong>"Last-In-First-Out"</strong> investment model &mdash; if
          the exit does not produce enough money to match the investments put in, the last investors in get their
          investment returned before anyone else gets anything.  The mechanism for this is called <strong>liquidation
          preferences</strong>.
        </p>
        <p>
          Later rounds tend to require higher amounts of capital with even higher exit growth needed to produce a return
          on that capital. By giving later investors the right to exit first, they may be able to get a return even if
          that higher growth does not materialize.  <strong>Thus, liquidation preferences reduce risk for later
          investors</strong>, helping to get on board.  However, this comes at the expense of earlier investors and
          common-stock holders, who now <em>require</em> the larger exit growth in order to get any return.
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

        <div className="panel panel-info">
          <div className="panel-heading">
            <i className="fa fa-hand-o-right"></i> The Liquidation Preference
          </div>
          <div className="panel-body">
            <p>
              Today is not a good day.  Adjust the exit valuation and note to which investors the exit return flows to
              in which order using the table on the right.
            </p>
            <p>
              If the future outlook of you venture is uncertain, which investors might push the company to take this
              exit opportunity today, and which investors might push to wait for another day?
            </p>
            <div>
              Exit valuation: <span ref='roundSlider'></span><br/>
            </div>
          </div>
        </div>
      </div>
    );
  }
});