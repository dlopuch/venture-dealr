var React = require('react');
var Reflux = require('reflux');

var actions = require('actions/actionsEnum');
var storyScenarios = require('models/storyScenarios');

var ScrollSpyContentsMixin = require('views/scrollSpy/ScrollSpyContentsMixin');

var SCROLLSPY_PROPS = {
  id: 'scenario-begin',
  name: 'Lets Begin'
}

module.exports = React.createClass({
  mixins: [
    ScrollSpyContentsMixin,
  ],

  onScrollSpyFocus: function(target) {
    actions.chart.selectMeasure('values');
    actions.round.setScenario(storyScenarios.rounds.demoExit);
    actions.chart.selectRound(null);
  },

  _setHeightState() {
    this.setState({
      windowHeight: $(window).height()
    });
  },
  componentDidMount() {
    $(window).on('resize', this._setHeightState.bind(this));
    this._setHeightState();
  },

  getInitialState() {
    return {
      scrollSpy: SCROLLSPY_PROPS
    };
  },

  render() {
    return (
      <div id={SCROLLSPY_PROPS.id}>
        <div className="alert alert-danger visible-xs visible-sm">

          <div className="visible-xs">
            <strong className="visible-xs">Not for Mobile. Yet.</strong>
            <p>
              This experience has been optimized for full-sized screens.  She'll run, but you will have a better
              experience if you come back on a larger screen.  Want to roll the dice anyways?  At least rotate into
              wide-screen.
            </p>
          </div>

          <div className="visible-sm">
            <strong className="visible-sm">Wider is Better</strong>
            <p>
              This experience has been optimized for full-sized screens.  Your screen is a bit too narrow.  Please
              increase the width a little bit or come back on a full-sized device.  It will be worth it, I promise.
            </p>
          </div>

          <p>
            Do you have an itch to design responsive visualizations for the constraints of mobile?  Work with me
            and <a href="https://github.com/dlopuch/venture-dealr" target="blank">submit a pull request!</a>
          </p>
        </div>

        <div className="hidden-sm hidden-xs alert alert-warning" style={{display: this.state.windowHeight > 650 ? 'none' : ''}}>
          <strong className="visible-sm">Make It Full Screen!</strong>
          <p>
            This experience becomes easier to read when the window is taller.  Try viewing this in presentation mode!
          </p>
        </div>

        <h1 className={this.state.scrollSpy.isFocused ? 'focus' : ''}>Lets Make Finance Dance!</h1>
        <p>
          Best experienced using <a href="https://www.google.com/chrome">Chrome</a>.  Firefox and Safari will work, but
          it won't be as smooth and immersive.
        </p>
        <p>&nbsp;</p>
        <p>
          Scroll down to start the journey.
        </p>
      </div>
    );
  }
});