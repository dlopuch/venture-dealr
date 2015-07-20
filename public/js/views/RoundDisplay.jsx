var React = require('react');

var ChartStore = require('stores/ChartStore');

var FORMAT_VALUE = n => d3.format('$s')( d3.format('.3r')(n) );

module.exports = React.createClass({

  getInitialState: function() {
    return {
      round: null
    };
  },

  _onRound: function(round) {
    this.setState({
      round: round
    });
  },

  componentDidMount: function() {
    ChartStore.on(ChartStore.EVENTS.ROUND_SELECTED, this._onRound);
  },

  componentWillUnmount: function() {
    ChartStore.removeListener(ChartStore.EVENTS.ROUND_SELECTED, this._onRound);
  },

  render: function() {
    if (!this.state.round)
      return (<div></div>);

    var r = this.state.round;
    var stats = r.stats;
    return (
      <div>
        <h3>
          {r.name}: raised {FORMAT_VALUE(stats.roundMoney)} at a {FORMAT_VALUE(stats.preMoney)} valuation
        </h3>
      </div>
    );
  }
});