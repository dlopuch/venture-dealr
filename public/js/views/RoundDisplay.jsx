var React = require('react');

var ChartStore = require('stores/ChartStore');

var FORMAT_VALUE = n => d3.format('$s')( d3.format('.3r')(n) );
var FORMAT_PERCENT = d3.format('%');

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

  _renderBreakdown: function() {
    var r = this.state.round;
    var stats = r.stats;
    var optionsPool = r.optionsPoolSpec;

    if (!stats.roundMoney) {
      return (<div>
        No valuation yet.
      </div>);
    }

    return (<div className='round-breakdown'>
      <table className='table table-condensed'>
        <tr>
          <td><div className='pull-right'>Effective Valuation*:</div></td>
          <td><span className='highlight-round-valuation'>{FORMAT_VALUE(stats.realPreMoney)}</span></td>
        </tr>
        <tr>
          <td><div className='pull-right'>New Options:</div></td>
          <td>
            <div>
              <span className='highlight-round-options'>{FORMAT_VALUE(stats.newOptionsMoney)}</span><br/>
              <span className="small">({FORMAT_PERCENT(optionsPool.percent)}
              {optionsPool.type === 'post' ?
                ' of post-financing' :
                ' pre-financing*'
              })</span>
            </div>
          </td>
        </tr>
        <tr>
          <td><div className='pull-right'>Round Money: </div></td>
          <td><span className='highlight-round-money'>{FORMAT_VALUE(stats.roundMoney)}</span></td>
        </tr>
        <tr>
          <td><div className='pull-right'><strong>Post Money: </strong></div></td>
          <td><strong><span className=''>{FORMAT_VALUE(stats.postMoney)}</span></strong></td>
        </tr>

      </table>
      <div className='small text-muted option-pool-shuffle'>

        *: Generally the pre-money includes any new options created during the round, even though the options are
        generally defined as a percentage of the post-financing (e.g. <em>"{FORMAT_PERCENT(optionsPool.percent)} of
        post-financing fully-diluted capitalization"</em>).
        See the <a href="http://venturehacks.com/articles/option-pool-shuffle" target="blank">Option Pool Shuffle</a>:

        <blockquote className='small text-muted'>
          “We think your company is worth {FORMAT_VALUE(stats.realPreMoney)}.
          But let’s create {FORMAT_VALUE(stats.newOptionsMoney)} worth of new options, add that to the value of
          your company, and call their sum your {FORMAT_VALUE(stats.preMoney)} ‘pre-money valuation’.”
        </blockquote>
      </div>
    </div>);
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
              raised <span className='highlight-round-money'>{FORMAT_VALUE(stats.roundMoney)}
              </span> at <span className='highlight-round-valuation'>{FORMAT_VALUE(stats.preMoney)}</span> pre-money
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
        {this._renderBreakdown()}
      </div>
    );
  }
});