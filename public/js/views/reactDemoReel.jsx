var $ = require('jquery');
var React = require('react');

var RoundChart = require('views/charts/RoundChart');

var chartReady = $.Deferred();

var DemoReelComponent = React.createClass({
  componentDidMount() {
    window.roundChart = new RoundChart( React.findDOMNode(this.refs.roundChart) );
    chartReady.resolve();
  },

  render() {
    return (
      <svg id="round-chart" ref="roundChart" className="round-chart" width="700" height="250"></svg>
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