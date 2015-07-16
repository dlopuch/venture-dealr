var _ = require('lodash');
var d3 = require('d3');
var EventEmitter = require('events').EventEmitter;

var dispatcher = require('dispatcher');
var ACTIONS = require('actions/actionsEnum');
var roundActions = require('actions/roundActions');

var ShareClass = require('models/ShareClass');


// Layout calculators
var PERCENTAGE_STACK_CALC = d3.layout.stack().values(stake => stake.percentages).y(o => o.n);
var VALUE_STACK_CALC = d3.layout.stack().values(stake => stake.values).y(o => o.n);


var OPTIONS_FIRST = '#666';
var OPTIONS_LAST = '#DDD';

// Color matrix definition: <ShareClass>_<round#>_<investment#>
// The idea of the color matrix is:
//   Inter-round: interpolate from dark-to-light (earlier rounds are darker)
//   Intra-round: interpolate across color scales (brown-to-purple for common, teal-to-green for preferred)
// Color scales are based off of colorbrewer.org diverging scales
var COMMON_FIRST_FIRST = '#8c510a'; // BrBG, brown dark-to-light
var COMMON_LAST_FIRST  = '#f6e8c3';
var COMMON_FIRST_LAST  = '#762a83'; // PRGn, purple dark-to-light
var COMMON_LAST_LAST   = '#e7d4e8';

var PREF_FIRST_FIRST   = '#01665e'; // BrBG, teal dark-to-light
var PREF_LAST_FIRST    = '#c7eae5';
var PREF_FIRST_LAST    = '#1b7837'; // PRGn, green dark-to-light
var PREF_LAST_LAST     = '#d9f0d3';

function createColorMatrix(chartData) {
  var lastRoundI = chartData.rounds.length - 1;

  var optionsScale = d3.scale.linear().range([OPTIONS_FIRST, OPTIONS_LAST]).domain([0, lastRoundI]);

  // Define scales that interpolate intra-round limits across rounds
  var commonFirstByRound = d3.scale.linear().range([COMMON_FIRST_FIRST, COMMON_LAST_FIRST]).domain([0, lastRoundI]);
  var commonLastByRound  = d3.scale.linear().range([COMMON_FIRST_LAST , COMMON_LAST_LAST ]).domain([0, lastRoundI]);
  var prefFirstByRound   = d3.scale.linear().range([PREF_FIRST_FIRST  , PREF_LAST_FIRST  ]).domain([0, lastRoundI]);
  var prefLastByRound    = d3.scale.linear().range([PREF_FIRST_LAST   , PREF_LAST_LAST   ]).domain([0, lastRoundI]);

  // Now for each round, create common and preferred intra-round scales
  var intraRoundScales = chartData.rounds.map(function(roundWrap, roundI) {
    var roundStakes = roundWrap.round.getAllStakes({onlyThisRound: true});
    var ret = {};

    // common scale
    var equities = _.filter(roundStakes, s => s.shareClass === ShareClass.COMMON && !s.isOptionsPool);
    var interpolator = d3.interpolateRgb(commonFirstByRound(roundI), commonLastByRound(roundI));
    ret[ ShareClass.COMMON ] = d3.scale.ordinal()
      .domain(_.pluck(equities, 'id'))
      .range( d3.range(0, 1 + 1 / equities.length, 1 / equities.length) // range from 0 to 1 inclusive
              .map(interpolator));

    // preferred scale
    equities = _.filter(roundStakes, s => s.shareClass === ShareClass.PREFERRED && !s.isOptionsPool);
    interpolator = d3.interpolateRgb(prefFirstByRound(roundI), prefLastByRound(roundI));
    ret[ ShareClass.PREFERRED ] = d3.scale.ordinal()
      .domain(_.pluck(equities, 'id'))
      .range( d3.range(0, 1 + 1 / equities.length, 1 / equities.length) // range from 0 to 1 inclusive
              .map(interpolator));

    return ret;
  });

  return function equityColorMatrix(equityStake) {
    // Only a single option pool per round, so color it according to the round number
    if (equityStake.isOptionsPool) {
      return optionsScale(equityStake.round.sequenceI);
    }

    // Otherwise, look up the appropriate scale by round and share class.  It's an ordinal by stake ID.
    return intraRoundScales[ equityStake.round.sequenceI ][ equityStake.shareClass ](equityStake.id);
  };
}


function colorStakes(chartData) {

  var equityColorMatrix = createColorMatrix(chartData);

  chartData.stakes.forEach(function(stakeWrap) {
    stakeWrap.color = equityColorMatrix(stakeWrap.stake);
  });
}

/**
 * Turns a list of stakes into a dataset of timeline series by round.  Used by RoundChart.
 * @param {string} measureAccessor Which measure in the stakes to use
 * @returns {Object} Dataset for the measure, with each series being a stacked EquityStake as it progresses
 */
function processStakesIntoMeasureDataset(chartData, measureAccessor) {
  var stakesData = chartData.stakes;
  var measureDataset = {
    series: stakesData.map(function(stakeWrap) {
      return {
        id: stakeWrap.stake.id,
        name: stakeWrap.stake.name,
        color: stakeWrap.color,
        data: stakeWrap[measureAccessor]
      };
    })
  };

  // Calculate the axis min/max.
  // Each .series[] is a stacked label, but it's already gone through the stack layout calculator.
  // Therefore, min is the min across the first series' y0's,
  // and max is the max across the *last* series' y0 + y (the y0 has already been passed up the stack by the calc)
  measureDataset.yAxis = {
    domain: [
      d3.min( _.pluck(measureDataset.series[0].data, 'y0') ),
      d3.max( measureDataset.series[measureDataset.series.length - 1 ].data.map(d => d.y0 + d.y) )
    ]
  };

  return measureDataset;
}


class ChartStore extends EventEmitter {
  constructor() {
    super();
    this.dispatchToken = dispatcher.register(this.dispatch.bind(this));

    this.lastGetMeasure = _.property('percentages');
  }

  handleNewRoundData(payload) {
    var chartData = payload.data;


    // Sort series
    chartData.stakes = _.sortByAll(
      // Start by reversing the stakes so last person in becomes first
      chartData.stakes.reverse(),

      // Now sorts:

      // First, all Option Pools go to the end
      function(s) {
        return s.stake.isOptionsPool ? 1 : 0;
      },

      // Then common behind preferred
      function(s) {
        return s.stake.shareClass === ShareClass.COMMON ? 1 : 0;
      }

      // Stable sort preserves remaining by round
    );


    // Calculate the stack data (modifies the underlying lists)
    PERCENTAGE_STACK_CALC(chartData.stakes); // adds stacking calcs to .percentages
    VALUE_STACK_CALC(chartData.stakes);      // adds stacking calcs to .values


    // consumer can do either
    //   _.pluck(chartData.stakes, 'percentages')
    //   _.pluck(chartData.stakes, 'values')
    // to render


    window.heydanData = chartData;

    colorStakes(chartData);

    var roundChartConfig = {
      xAxis: {
        domain: _.pluck(chartData.rounds, 'round.id'),
        range: _.pluck(chartData.rounds, 'round.name')
      },

      datasets: {
        'percentages': processStakesIntoMeasureDataset(chartData, 'percentages'),

        'values': processStakesIntoMeasureDataset(chartData, 'values'),
      },

      getMeasure: this.lastGetMeasure
    };

    window.hdRoundChartConfig = roundChartConfig;

    this.emit('roundTimelineData', roundChartConfig);


    // Now do the scatter transforms
    var percentValueConfig = {
      series: chartData.stakes.map(function(stakeWrap) {
        return {
          color: stakeWrap.color,
          stake: stakeWrap.stake,
          data: stakeWrap.percentages
            .map(function(p, i) {
              return {
                // percentage axis:
                percentage: p.n,

                // value axis:
                value: stakeWrap.values[i].n,

                // meta:
                round: p.xRound,
                roundStats: p.xRoundStats
              };
            })
            // filter out any null points (side-effect of stacked bar chart normalization)
            .filter(tuple => tuple.percentage !== null)
        };
      })
    };

    var allDataPoints = _(percentValueConfig.series).pluck('data').flatten().value();

    percentValueConfig.axes = {
      value: {
        formatter: d3.format(','),
        domain: [
          0,
          _(allDataPoints).pluck('value').max()
        ]
      },

      percentage: {
        formatter: d3.format('%'),
        domain: [
          0,
          _(allDataPoints).pluck('percentage').max()
        ]
      }
    };

    this.emit('percentValueScatterData', percentValueConfig);
    window.hdPercentValueConfig = percentValueConfig;
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
