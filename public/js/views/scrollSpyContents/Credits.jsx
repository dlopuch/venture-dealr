var _ = require('lodash');
var React = require('react');
var Reflux = require('reflux');

var storyScenarios = require('models/storyScenarios');

var ScrollSpyContentsMixin = require('views/scrollSpy/ScrollSpyContentsMixin');

var SCROLLSPY_PROPS = {
  id: 'scenario-credits',
  name: 'Credits'
}

module.exports = React.createClass({
  mixins: [ScrollSpyContentsMixin],

  getInitialState() {
    return {
      scrollSpy: SCROLLSPY_PROPS
    };
  },

  componentDidMount: function() {
    $('#datahero2').tooltip();
  },

  onScrollSpyFocus: function(target) {
    actions.chart.selectMeasure('values');
    actions.exit.changeValuation(storyScenarios.rounds.exit, 1000000000);
    actions.round.setScenario(storyScenarios.rounds.exit);
    actions.chart.selectRound(null);
  },

  render() {
    return (
      <div id={SCROLLSPY_PROPS.id}>
        <h1 className={this.state.scrollSpy.isFocused ? 'focus' : ''}>Here's To the Moonshots!</h1>
        <p>
          Thanks for tuning in! There are still many more topics to cover beyond this introduction: debt and debt
          discounts, tax implications of exercising options, valuation triggers, and many more.
        </p>
        <p>
          Want more detail on a specific topic?  Was something confusing or not completely accurate?  Want to just send
          some love? (It's free.) <a href="https://twitter.com/floatrock" target="blank">@floatrock</a>.
        </p>
        <p>
          Found a bug?  <a href="https://github.com/dlopuch/venture-dealr/issues">File a bug</a>!
        </p>
        <p>
          A special thanks to everyone who gave early reviews, feedback, and suggestions: Ray, Dave, Sean, Kyan, Islam,
          Adam, Connor, Jeff, and the whole crew
          at <a id="datahero2" href="https://www.datahero.com" target="_blank" data-toggle="tooltip" data-placement="bottom"
                title="Join our team to build more interactive visualizations like this!">DataHero</a> for the
          original hackathon inspiration.  <i className="fa fa-heart"> </i>
        </p>


        <h3 className={this.state.scrollSpy.isFocused ? 'focus' : ''}>Coming Next: Venture Makr</h3>
        <p>
          Like what you saw?  Send some social love and encouragement for <strong>Venture Makr</strong>: a full editor to
          create your own rounds with custom valuations and equity distributions.  Turn the knobs on your own creations and
          see how scenarios might unfold differently.
        </p>
        <p>
          The numbers presented here have been made up for illustrative purposes only.  Although money raised is often
          publicly announced and recorded in places like Crunchbase, valuations are generally kept private.  If you
          know of any ventures &mdash; failed, successful, or otherwise &mdash; which have made their numbers publicly
          available, drop me a line and let's tell their story (or the story of what could have been).
        </p>


        <h3 className={this.state.scrollSpy.isFocused ? 'focus' : ''}>Always Tip Your Bartender</h3>
        <p>
          Team Beer: <i className="fa fa-btc"></i>1BVJ2Kyvo9Np6uiCooFm3XMhjgJMLUquZr
        </p>
        <p>
          Team Whiskey: <i className="fa fa-btc"></i>1MQvPwNWjqAD1RW5uCFBYfjtgQhfa2G9nK
        </p>
      </div>
    );
  }
});