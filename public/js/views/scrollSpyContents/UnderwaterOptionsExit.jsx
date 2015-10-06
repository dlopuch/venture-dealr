var _ = require('lodash');
var numeral = require('numeral');
var React = require('react');
var Reflux = require('reflux');
var Slider = require('bootstrap-slider');

var analytics = require('analytics');
var ChartStore = require('stores/ChartStore');
var ScrollSpyContentsMixin = require('views/scrollSpy/ScrollSpyContentsMixin');

var SCROLLSPY_PROPS = {
  id: 'scenario-underwater-options-exit',
  name: 'Underwater Options and Exits'
}

module.exports = React.createClass({
  mixins: [
    ScrollSpyContentsMixin,
    Reflux.listenTo(actions.exit.changeValuation, '_onChangeExitValuation')
  ],

  getInitialState() {
    return {
      scrollSpy: SCROLLSPY_PROPS,
      sliderEnabled: false,
      sliderValue: storyScenarios.rounds.exit.valuation
    };
  },

  componentDidMount: function() {
    this._origSeriesCValuation = storyScenarios.rounds.seriesC.preMoneyValuation;
    this._origExitValuation = storyScenarios.rounds.exit.valuation;

    var slideStartMs;
    var slideStartValue;

    this._slider = new Slider( React.findDOMNode(this.refs.roundSlider), {
      enabled: this.state.sliderEnabled,
      value: this.state.sliderValue,
      min: 10000000,
      max: 150000000,
      step: 1000000,
      formatter: ChartStore.CURRENCY_FORMATTER,
      scale: 'logarithmic'
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

  _onSliderChange: function(sliderVals) {
    actions.exit.changeValuation(storyScenarios.rounds.exit, sliderVals.newValue, {throttle: true});
    actions.chart.selectRound(storyScenarios.rounds.exit);
  },

  _select20M: function() {
    actions.exit.changeValuation(storyScenarios.rounds.exit, 20000000);
  },

  selectSeriesC() {
    actions.chart.selectRound(storyScenarios.rounds.seriesC);
  },

  _onChangeExitValuation: function(exit, value) {
    if (exit !== storyScenarios.rounds.exit)
      return; // then we don't care about it

    this.setState({
      sliderValue: value
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

    // Sleight-of-hand: the positive-exit-some-have-nothing scenario case becomes noticable mainly on low round-to-round
    // valuation growth (otherwise the high growth in an earlier round already made most stakeholders whole).  To show
    // off the effect, we're going to lower the growth of the Series C round to show more cases where a stakeholder is
    // underwater
    actions.round.changeRoundPreMoneyValuation(storyScenarios.rounds.seriesC, 40000000);

    actions.exit.changeValuation(storyScenarios.rounds.exit, 75000000);
    actions.round.setScenario(storyScenarios.rounds.exit);
    actions.chart.selectRound(storyScenarios.rounds.exit);
  },

  onScrollSpyUnfocus: function(target) {
    this.setState({
      sliderEnabled: false
    });

    actions.round.changeRoundPreMoneyValuation(storyScenarios.rounds.seriesC, this._origSeriesCValuation);
    // actions.exit.changeValuation(storyScenarios.rounds.exit, this._origExitValuation);  // interferes with prev's set
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
        <h2 className={this.state.scrollSpy.isFocused ? 'focus' : ''}>Underwater Options: A Positive Exit With Nothing</h2>
        <p>Even a positive exit can still leave some shareholders with nothing.</p>
        <p>
          Because the exit is subject to preferences, the pie is not split evenly.  Depending on liquidation
          preferences, common-stock holders may see nothing until all preferred-stock holders get their initial money
          back out.  Only then is the remainder split equally (however, note it is split equally between both the
          common <em>and</em> preferred holders).
        </p>
        <p>
          To the preferred-stock holders, this remainder split produces an additional return on top of their
          already-satisfied liquidation preferences.  Common-stock holders, however, may find themselves <strong>needing
          to pay more to exercise their options than their stakes are worth</strong> and instead just walk away with
          nothing.
        </p>

        <div className="panel panel-info">
          <div className="panel-heading">
            <i className="fa fa-hand-o-right"></i> The Underwater Options
          </div>
          <div className="panel-body">

            <p>
              Our last round, the Series C, had a post-money valuation
              of <strong onMouseOver={this.selectSeriesC}><span className="highlight-round-valuation">$ 6</span><span className="highlight-round-money">5M</span></strong>.
              How big do you think our exit needs to be before no one is underwater?
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