var _ = require('lodash');
var numeral = require('numeral');
var React = require('react');
var Reflux = require('reflux');
var Slider = require('bootstrap-slider');

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

    this._slider = new Slider( React.findDOMNode(this.refs.roundSlider), {
      enabled: this.state.sliderEnabled,
      value: this.state.sliderValue,
      min: 1000000,
      max: 110000000,
      step: 1000000,
      formatter: function(n) {
        return numeral(n).format('$ 00a');
      }
    })
    .on('change', this._onSliderChange);
  },

  _onSliderChange: function(sliderVals) {
    actions.exit.changeValuation(storyScenarios.rounds.exit, sliderVals.newValue);
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
    actions.chart.selectMeasure('values');

    // Sleight-of-hand: the positive-exit-some-have-nothing scenario case becomes noticable mainly on low round-to-round
    // valuation growth (otherwise the high growth in an earlier round already made most stakeholders whole).  To show
    // off the effect, we're going to lower the growth of the Series C round to show more cases where a stakeholder is
    // underwater
    actions.round.changeRoundPreMoneyValuation(storyScenarios.rounds.seriesC, 40000000);

    actions.exit.changeValuation(storyScenarios.rounds.exit, 75000000);
    actions.round.setScenario(storyScenarios.rounds.exit);
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
          Because the exit amount is subject to preferences, the pie is not split evenly.  Some investors may make their
          money back (plus an extra profit once they've met their initial investment), but the remaining extra profit
          may not be enough to match the value of common-stock holders.
        </p>
        <p>
          If the common stock is in the form of options, <strong>the options holder would have to pay more than their
          stakes were worth</strong> in order to exercise the options.  The holder would instead just walk away
          with nothing.
        </p>
        <p>
          Oftentimes a positive exit is not enough to make all stakeholders whole.  How big do you think our exit needs
          to be before no one is underwater?
        </p>
        <div>
          Exit valuation: <span ref='roundSlider'></span><br/>
          <small>(Note the Last-In-First-Out dynamics in the $20M - $35M range)</small>
        </div>
      </div>
    );
  }
});