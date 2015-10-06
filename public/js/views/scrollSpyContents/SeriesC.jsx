var _ = require('lodash');
var React = require('react');
var Reflux = require('reflux');

var analytics = require('analytics');
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
    analytics.event(
      analytics.E.ROUND_CHART_BUTTON.ID,
      analytics.E.ROUND_CHART_BUTTON.PERCENTAGE_VIEW,
      SCROLLSPY_PROPS.id
    );
    actions.chart.selectMeasure('percentages');
  },

  switchToValue() {
    analytics.event(
      analytics.E.ROUND_CHART_BUTTON.ID,
      analytics.E.ROUND_CHART_BUTTON.VALUE_VIEW,
      SCROLLSPY_PROPS.id
    );
    actions.chart.selectMeasure('values');
  },

  onScrollSpyFocus: function(target) {
    actions.ui.showPVScatter(true);
    actions.chart.showFirstRoundLabels(false);
    actions.round.setScenario(storyScenarios.rounds.seriesC);
    actions.chart.selectRound(storyScenarios.rounds.seriesC);
  },

  render() {
    return (
      <div id={SCROLLSPY_PROPS.id}>
        <h2 className={this.state.scrollSpy.isFocused ? 'focus' : ''}>Series C: Next Stop, the Moon!</h2>
        <p>
          Welcome to the minors. Not only did we raise <span className="highlight-round-money"><strong>$ 25M</strong></span>,
          we increased our valuation up to <span className="highlight-round-valuation"><strong>$ 75M</strong></span>. Check
          out the bump in the value of our stakes!
        </p>
        <p>
          Since times are good, let's revisit dilution.  Switch over
          to <a onClick={this.switchToPercentage} className={'btn btn-xs ' + (this.state.lastMeasure === 'percentages' ? 'btn-primary' : 'btn-default')}>
            <i className="fa fa-hand-o-right"></i> percentage view
          </a>.  Note how our stakes are becoming a smaller and smaller percentage of the whole.  We're giving away parts
          of the company as we bring on new investors.
        </p>
        <p>
          Now switch back to <a onClick={this.switchToValue} className={'btn btn-xs ' + (this.state.lastMeasure === 'percentages' ? 'btn-default' : 'btn-primary')}>
            <i className="fa fa-hand-o-right"></i> value view
          </a>.  Although our percentage-stake keeps getting smaller, the value of the equity keeps growing due to the
          increasing valuation in each subsequent round.
        </p>
        <p>
          You can see this playing out in the percentage-value scatter plot on the right.  Each equity stake keeps
          moving to the right and up: the ownership percentage gets diluted, but the value of the stake keeps going
          higher.
        </p>
        <p>
          Things don't always work out this way.  Could the scatterplot series twist down into a &cap; shape?  Or
          could you play the game so that your series twists back on itself like a &sup;, <em>increasing</em> your
          percentage of the whole while still being more valuable?  Lets find out!
        </p>
      </div>
    );
  }
});