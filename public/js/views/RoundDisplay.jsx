var React = require('react');
var Reflux = require('reflux');

var Exit = require('models/Exit');

var ChartStore = require('stores/ChartStore');

var FORMAT_VALUE = n => d3.format('$s')( n === 0 ? 0 : d3.format('.3r')(n) );
var FORMAT_PERCENT = d3.format('%');

module.exports = React.createClass({
  mixins: [Reflux.listenTo(ChartStore, '_onChartStoreChange')],

  getInitialState: function() {
    return {
      round: null
    };
  },

  componentDidMount: function() {
    var self = this;
    $('#round-details-display')
    .affix({
      offset: {
        top: $('#round-details-display').offset().top - $('#charts-container').height()
      }
    })
    .on('affixed.bs.affix', function() {
      self.setState({
        affixClass: 'affix'
      });
    })
    .on('affixed-top.bs.affix', function() {
      self.setState({
        affixClass: 'affix-top'
      });
    })
    .on('affixed-bottom.bs.affix', function() {
      self.setState({
        affixClass: 'affix-bottom'
      });
    })
    console.log('affixed');
  },

  _onChartStoreChange: function(chartStoreState) {
    //if (this.state.round !== chartStoreState.selectedRound) {
      this.setState({
        round: chartStoreState.selectedRound
      });
    //}
  },

  _renderBreakdown: function() {
    if (this.state.round instanceof Exit) {
      return this._renderExitBreakdown();
    } else {
      return this._renderRoundBreakdown();
    }
  },

  _renderExitBreakdown: function() {
    var r = this.state.round;
    var stats = r.stats;

    return (
      <div key='exitBreakdown' className='round-breakdown'>
        <table className='table table-condensed exit-table'>
          <thead>
            <tr>
              <th>Equity Stake</th>
              <th>Share Class</th>
              <th>Money In <br/>(or Strike Price)</th>
              <th>Money Out</th>
              <th>ROI</th>
            </tr>
          </thead>
          <tbody>
            {stats.orderedStakesAndPayouts.map(function(snp) {
              var isUnderwater = snp.roi !== Infinity && !_.isNaN(snp.roi) && snp.roi < 1;

              return (
                <tr key={snp.stake.id}>
                  <td>{snp.stake.name}</td>
                  <td>{snp.stake.shareClass === 'common' ? 'Common' : 'Preferred'}</td>
                  <td>{snp.breakevenValue === 0 ? '-' : ChartStore.CURRENCY_FORMATTER(snp.breakevenValue)}</td>
                  <td className={isUnderwater ? 'underwater' : ''}>{ChartStore.CURRENCY_FORMATTER(snp.payout)}</td>
                  <td className={isUnderwater ? 'underwater' : ''}>
                    {snp.roi === Infinity || _.isNaN(snp.roi) ? '' : FORMAT_PERCENT(snp.roi) }
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <th></th>
              <th></th>
              <th className="text-right">Total Exit:</th>
              <th>{ChartStore.CURRENCY_FORMATTER(r.valuation)}</th>
              <th></th>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  },

  _renderRoundBreakdown: function() {
    var r = this.state.round;
    var stats = r.stats;
    var optionsPool = r.optionsPoolSpec;
    var hasOptionsPool = !!optionsPool.percent;

    if (!stats.roundMoney) {
      return (<div>
        No valuation yet.
      </div>);
    }


    return (<div className='round-breakdown'>
      <table key='roundBreakdown' className='table table-condensed'>
        <tr>
          <td>
            <div className='pull-right'>
              {hasOptionsPool ? 'Effective Valuation*:' : 'Valuation:'}
            </div>
          </td>
          <td><span className='highlight-round-valuation'>{FORMAT_VALUE(stats.realPreMoney)}</span></td>
        </tr>
        { !hasOptionsPool ? (<tr></tr>) : (
        <tr>
          <td><div className='pull-right'>New Options:</div></td>
          <td>
            <div>
              <span className='highlight-round-options'>{FORMAT_VALUE(stats.newOptionsValue)}</span><br/>
              <span className="small">({FORMAT_PERCENT(optionsPool.percent)}
              {optionsPool.type === 'post' ?
                ' of post-financing' :
                ' pre-financing*'
              })</span>
            </div>
          </td>
        </tr>
        )}
        <tr>
          <td><div className='pull-right'>Round Money: </div></td>
          <td><span className='highlight-round-money'>{FORMAT_VALUE(stats.roundMoney)}</span></td>
        </tr>
        <tr>
          <td><div className='pull-right'><strong>Post Money: </strong></div></td>
          <td><strong><span className=''>{FORMAT_VALUE(stats.postMoney)}</span></strong></td>
        </tr>

      </table>
      { !hasOptionsPool ? '' : (
      <div className='small text-muted option-pool-shuffle'>

        *: Generally the pre-money includes any new options created during the round, even though the options are
        generally defined as a percentage of the post-financing (e.g. <em>"{FORMAT_PERCENT(optionsPool.percent)} of
        post-financing fully-diluted capitalization"</em>).
        See the <a href="http://venturehacks.com/articles/option-pool-shuffle" target="blank">Option Pool Shuffle</a>:

        <blockquote className='small text-muted'>
          “We think your company is worth {FORMAT_VALUE(stats.realPreMoney)}.
          But let’s create {FORMAT_VALUE(stats.newOptionsValue)} worth of new options, add that to the value of
          your company, and call their sum your {FORMAT_VALUE(stats.preMoney)} ‘pre-money valuation’.”
        </blockquote>
      </div>
      )}
    </div>);
  },

  _renderHeader() {
    var r = this.state.round;
    var stats = r.stats;

    return (
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
    );
  },

  render: function() {
    var header = '';
    var breakdown = '';

    if (this.state.round && this.state.round.stats) {
      header = this._renderHeader();
      breakdown = this._renderBreakdown();
    }

    return (
      <div id="round-details-display" className={'round-details ' + (this.state.affixClass || '')}>
        {header}
        {breakdown}
      </div>
    );
  }
});