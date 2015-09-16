var _ = require('lodash');
var React = require('react');
var Reflux = require('reflux');

var storyScenarios = require('models/storyScenarios');

var ScrollSpyContentsMixin = require('views/scrollSpy/ScrollSpyContentsMixin');

var SCROLLSPY_PROPS = {
  id: 'scenario-series-c',
  name: 'Series C'
}

module.exports = React.createClass({
  mixins: [
    ScrollSpyContentsMixin,
    Reflux.listenTo(actions.chart.selectMeasure, '_onSelectMeasure')
  ],

  getInitialState() {
    return {
      scrollSpy: SCROLLSPY_PROPS
    };
  },

  _onSelectMeasure: function(measure) {
    this.setState({
      lastMeasure: measure
    });
  },

  switchToPercentage() {
    actions.chart.selectMeasure('percentages');
  },

  switchToValue() {
    actions.chart.selectMeasure('values');
  },

  onScrollSpyFocus: function(target) {
    actions.round.setScenario(storyScenarios.rounds.seriesC);
  },

  render() {
    return (
      <div id={SCROLLSPY_PROPS.id}>
        <h2 className={this.state.scrollSpy.isFocused ? 'focus' : ''}>Series C: Next Stop, the Moon!</h2>
        <p>
          Not only did we raise <strong>$ 25M</strong>, we increased our valuation up to <strong>$ 75M</strong>. Check
          out the bump in the value of our stakes!
        </p>
        <p>
          Since times are good, now is a good time to check out dilution again.  Switch over to {
            this.state.lastMeasure === 'percentages' ?
              'percentage view' :
              (<a onClick={this.switchToPercentage}>percentage view</a>)
          }.  Note how our stakes are becoming a smaller and smaller percentage of the whole.  We're giving away parts
          of the company as we bring on new investors.
        </p>
        <p>
          Now switch back to {
            this.state.lastMeasure === 'values' ?
              'value view' :
              (<a onClick={this.switchToValue}>value view</a>)
          }.  Although our percentage-stake keeps getting smaller, the value of the equity keeps growing due to the
          increasing valuation in each subsequent round.
        </p>
        <p>
          You can see this playing out in the percentage-value scatter plot on the right.  Each equity stake keeps
          moving to the right and up -- the ownership percentage gets diluted, but the value of the stake keeps going
          higher.
        </p>
        <p>
          Things don't always work out this way.  Could those scatterplot series turn into an inverted-U shape?  Or
          could you play the game so that your series twists back on itself like a mirrored 'C'?  Lets find out!
        </p>
      </div>
    );
  }
});