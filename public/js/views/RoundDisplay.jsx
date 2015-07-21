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

    var summaryText = '';
    if (stats.preMoney && stats.roundMoney) {
      summaryText = ": raised " + FORMAT_VALUE(stats.roundMoney) + " at a " + FORMAT_VALUE(stats.preMoney) + " valuation";

    } else if (stats.roundMoney) {
      summaryText = ": raised " + FORMAT_VALUE(stats.roundMoney);

    } else if (stats.preMoney) {
      summaryText = ": valued at " + FORMAT_VALUE(stats.preMoney);

    }

    return (
      <div>
        <h3>
          {r.name}{stats.preMoney || stats.roundMoney ? ': ' : ''}
          {stats.preMoney && stats.roundMoney ?
            <span>
              raised <span className='highlight-round-money'>{FORMAT_VALUE(stats.roundMoney)}</span> at
              a <span className='highlight-round-valuation'>{FORMAT_VALUE(stats.preMoney)}</span> valuation
            </span> :
            ''
          }
          {stats.preMoney && !stats.roundMoney ?
            <span>
              valued at <span className='highlight-round-valuation'>{FORMAT_VALUE(stats.preMoney)}</span>
            </span> :
            ''
          }
          {!stats.preMoney && stats.roundMoney ?
            <span>
              raised <span className='highlight-round-money'>{FORMAT_VALUE(stats.roundMoney)}</span>
            </span> :
            ''
          }
        </h3>
      </div>
    );
  }
});