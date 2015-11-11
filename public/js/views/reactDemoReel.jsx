var $ = require('jquery');
var React = require('react');
var Reflux = require('reflux');

var DemoStore = require('stores/DemoStore');

var RoundChart = require('views/charts/RoundChart');

var chartReady = $.Deferred();

var DemoReelComponent = React.createClass({
  mixins: [
    Reflux.listenTo(DemoStore, '_onDemoStore')
  ],

  getInitialState() {
    return {
      lastHeader: 'Old Header',
      newHeader: 'New Header'
    }
  },

  _onDemoStore(newDemoState) {
    this.setState(newDemoState);
  },

  componentDidMount() {
    window.roundChart = new RoundChart( React.findDOMNode(this.refs.roundChart) );
    chartReady.resolve();
  },

  render() {
    return (
      <div className="demo-reel">
        <svg id="round-chart" ref="roundChart" className="round-chart" width="700" height="250"></svg>

        { this.state.lastHeader ?
          (<h1 key={this.state.lastHeader} className="animated fade-out">{this.state.lastHeader}</h1>) :
          ''
        }
        { this.state.newHeader ?
          (<h1 key={this.state.newHeader}>{this.state.newHeader}</h1>) :
          ''
        }
        <div id="supertitle" className="supertitle animated"><span>Venture Dealr: </span>Visualize and turn the knobs on</div>
        <div className="subtitle">dlopuch.github.io/venture-dealr</div>

      </div>
    );
  }
});

React.render(
  <div id="venture-dealr-demo">
    <DemoReelComponent/>
  </div>,
  document.getElementById('react-app')
);

module.exports = chartReady.promise();