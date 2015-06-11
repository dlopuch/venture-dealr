var _ = require('lodash');
var d3 = require('d3');
var EventEmitter = require('events').EventEmitter;

var dispatcher = require('dispatcher');
var ACTIONS = require('actions/actionsEnum');
var roundActions = require('actions/roundActions');


var PERCENTAGE_STACK_CALC = d3.layout.stack().values(stake => stake.percentages).y(o => o.n);
var VALUE_STACK_CALC = d3.layout.stack().values(stake => stake.values).y(o => o.n);

/**
 *
 * @param {Object} measureAccessor
 */
function processStakesIntoSeries(stakesData, measureAccessor) {
  var serie = {
    series: stakesData.map(function(stakeWrap) {
      return {
        id: stakeWrap.stake.id,
        name: stakeWrap.stake.name,
        data: stakeWrap[measureAccessor]
      };
    })
  };

  // Calculate the axis min/max.
  // Each .series[] is a stacked label, but it's already gone through the stack layout calculator.
  // Therefore, min is the min across the first series' y0's,
  // and max is the max across the *last* series' y0 + y (the y0 has already been passed up the stack by the calc)
  serie.yAxis = {
    domain: [
      d3.min( _.pluck(serie.series[0].data, 'y0') ),
      d3.max( serie.series[serie.series.length - 1 ].data.map(d => d.y0 + d.y) )
    ]
  };

  return serie;
}

class ChartStore extends EventEmitter {
  constructor() {
    super();
    this.dispatchToken = dispatcher.register(this.dispatch.bind(this));

    this.lastGetMeasure = _.property('percentages');
  }

  handleNewRoundData(payload) {
    var chartData = payload.data;

    // Calculate the stack data (modifies the underlying lists)
    PERCENTAGE_STACK_CALC(chartData.stakes); // adds stacking calcs to .percentages
    VALUE_STACK_CALC(chartData.stakes);      // adds stacking calcs to .values

    // consumer can do either
    //   _.pluck(chartData.stakes, 'percentages')
    //   _.pluck(chartData.stakes, 'values')
    // to render

    window.heydanData = chartData;

    var chartConfig = {
      xAxis: {
        domain: _.pluck(chartData.rounds, 'round.id'),
        range: _.pluck(chartData.rounds, 'round.name')
      },

      datasets: {
        'percentages': processStakesIntoSeries(chartData.stakes, 'percentages'),

        'values': processStakesIntoSeries(chartData.stakes, 'values'),
      },

      getMeasure: this.lastGetMeasure
    };

    window.hdConfig = chartConfig;

    this.emit('roundTimelineData', chartConfig);
  }

  handleSelectMeasure(payload) {
    this.lastGetMeasure = _.property(payload.measureName);

    this.emit('selectMeasure', this.lastGetMeasure);
  }

  dispatch(payload) {
    switch (payload.action) {
      case ACTIONS.CHART.NEW_ROUND_DATA:
        this.handleNewRoundData(payload);
        break;

      case ACTIONS.CHART.SELECT_MEASURE:
        this.handleSelectMeasure(payload);
        break;

    }
  }
}

module.exports = new ChartStore();
