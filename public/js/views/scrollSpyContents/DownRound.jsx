var _ = require('lodash');
var numeral = require('numeral');
var React = require('react');
var Reflux = require('reflux');
var Slider = require('bootstrap-slider');

var storyScenarios = require('models/storyScenarios');

var ScrollSpyContentsMixin = require('views/scrollSpy/ScrollSpyContentsMixin');

var chartStore = require('stores/ChartStore');

var SCROLLSPY_PROPS = {
  id: 'scenario-down-round',
  name: 'Down Round'
}

module.exports = React.createClass({
  mixins: [
    ScrollSpyContentsMixin,
    Reflux.listenTo(actions.chart.selectMeasure, '_onSelectMeasure'),
    Reflux.listenTo(actions.round.changeRoundPreMoneyValuation, '_onChangeRoundPreMoneyValuation')
  ],

  getInitialState() {
    return {
      scrollSpy: SCROLLSPY_PROPS,
      sliderValue: storyScenarios.rounds.seriesB.preMoneyValuation,
      sliderEnabled: false,
      wasFocused: false,
      lastMeasure: 'values'
    };
  },

  onScrollSpyFocus: function(target) {
    actions.chart.selectMeasure('values');
    actions.round.setScenario(storyScenarios.rounds.seriesC);
    actions.round.changeRoundPreMoneyValuation(storyScenarios.rounds.seriesB, 6000000);
    actions.chart.selectRound(storyScenarios.rounds.seriesB);

    this.setState({
      sliderEnabled: true,
      wasFocused: true
    });

  },

  onScrollSpyUnfocus: function(target) {
    if (!this.state.wasFocused)
      return;

    actions.round.changeRoundPreMoneyValuation(storyScenarios.rounds.seriesB, this._origPreMoney);
    this.setState({
      sliderEnabled: false
    });
  },

  _onSelectMeasure: function(measure) {
    this.setState({
      lastMeasure: measure
    });
  },

  switchToPercentages() {
    actions.chart.selectMeasure('percentages');
  },

  switchToValues() {
    actions.chart.selectMeasure('values');
  },

  componentDidMount() {
    this._origPreMoney = storyScenarios.rounds.seriesB.preMoneyValuation;

    this._slider = new Slider( React.findDOMNode(this.refs.roundSlider), {
      enabled: this.state.sliderEnabled,
      value: this.state.sliderValue,
      min: 6000000,
      max: 60000000,
      step: 500000,
      formatter: function(n) {
        return numeral(n).format('$ 00.0a');
      },
      ticksPositions: [0, 50, 100],
      ticksLabels: ['Down Round', '|', 'Growth Round']
    })
    .on('change', this._onSliderChange);
  },

  _onSliderChange: function(sliderVals) {
    actions.round.changeRoundPreMoneyValuation(storyScenarios.rounds.seriesB, sliderVals.newValue);

    actions.chart.selectRound(storyScenarios.rounds.seriesB);
  },

  _onChangeRoundPreMoneyValuation: function(round, value) {
    if (round !== storyScenarios.rounds.seriesB)
      return; // don't care about it

    this.setState({
      sliderValue: value
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
        <h1 className={this.state.scrollSpy.isFocused ? 'focus' : ''}>Down Round</h1>
        <p>
          A down round happens when your valuation decreases relative to the previous round.  Investors will still
          give you money, but on terms that value your company less than before.  <strong>Down rounds are dangerous
          because they can dilute your shares in a way that shifts future value gains away from you (and existing
          investors) towards the new investors.</strong>
        </p>
        <p>
          A valuation is merely a number pulled out of thin air that all participants agree is appropriate. Viewed this
          way, <strong>your pre-money valuation is merely a knob your investors spin to determine what level
          of dilution results from a set investment amount</strong>.  Lets see that in action.
        </p>
        <p>
          Lets look at your Series B.
        </p>
        <p>
          Your Series B investors are willing to give you a
          fixed <span className="highlight-round-money"><strong>$ 6M</strong></span>.  How much you get diluted depends
          on your pre-money valuation.  Tweak it and note the relative composition of your Series B.  <strong>More
          importantly, note how differently the future Series C growth gets distributed with a down round.</strong>
        </p>
        <p>
          <span className="highlight-round-options">Ser</span><span className="highlight-round-valuation">ies B Pre-Money Valuation</span>: &nbsp; &nbsp;<span ref='roundSlider'></span> <br/>
          <small>(Left for down round)</small>
        </p>

        <div className="btn-group poor-mans-toggle">
          <div
            className={'btn ' + (this.state.lastMeasure === 'values' ? 'btn-default' : 'btn-primary disabled')}
            onClick={this.switchToPercentages}
          >Percentage View</div>
          <div
            className={'btn ' + (this.state.lastMeasure === 'values' ? 'btn-primary disabled' : 'btn-default')}
            onClick={this.switchToValues}
          >Value View</div>
        </div>

      </div>
    );
  }
});