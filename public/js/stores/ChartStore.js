/**
 * Flux data store to calculate new chart data based on model / data changes.
 *
 * Is a EventEmitter.  See EVENTS for how components should be notified of new data.
 */

var _ = require('lodash');
var d3 = require('d3');
var numeral = require('numeral');
var Reflux = require('reflux');

var actions = require('actions/actionsEnum');

var Exit = require('models/Exit');
var ShareClass = require('models/ShareClass');


// Layout calculators
var PERCENTAGE_STACK_CALC = d3.layout.stack().values(stake => stake.percentages).y(o => o.n);
var VALUE_STACK_CALC      = d3.layout.stack().values(stake => stake.values     ).y(o => o.n);


var PERCENTAGE_FORMATTER = d3.format('%');

numeral.language('en', {
  delimiters: {
    thousands: ',',
    decimal: '.'
  },
  abbreviations: {
    thousand: 'k',
    million: 'M',
    billion: 'B',
    trillion: 'T'
  },
  currency: {
    symbol: '$'
  }
});
var currencyFormatterO = numeral(0);
var CURRENCY_FORMATTER = function(n) {
  return currencyFormatterO.set(n).format('$ 00[.]0a');
};



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

  if (chartData.rounds[lastRoundI].round instanceof Exit) {
    lastRoundI--;
  }

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
      Math.floor( d3.max( measureDataset.series[measureDataset.series.length - 1 ].data.map(d => d.y0 + d.y) ) )
    ]
  };

  // Floating point cludge: if it's 'percentage', force max to be 1, not 1.000000001
  if (measureAccessor === 'percentages') {
    measureDataset.yAxis.domain[1] = 1;
    measureDataset.yAxis.formatter = PERCENTAGE_FORMATTER;
  } else {
    measureDataset.yAxis.formatter = CURRENCY_FORMATTER;
  }

  return measureDataset;
}


module.exports = Reflux.createStore({
  CURRENCY_FORMATTER: CURRENCY_FORMATTER,

  init: function() {
    this.listenToMany({
      'onNewRoundData' : actions.round.newRoundData,
      'onSelectMeasure': actions.chart.selectMeasure,
      'onSelectRound'  : actions.chart.selectRound,
      'onSetAxisLock'  : actions.chart.setAxisLock,
      'onClearAxisLock': actions.chart.clearAxisLock
    });

    this.state = {
      roundChartConfig: null,
      percentValueConfig: null,
      percentValueConfigAxisLimits: {
        axisLock: false,
        value: [Infinity, -Infinity],
        percentage: [Infinity, -Infinity]
      },
      selectedMeasure: 'values',
      selectedRound: null
    };
  },

  onNewRoundData: function(chartData, opts) {

    // new round data means the round selection needs to be cleared out
    //this.state.selectedRound = null;

    // Sort series
    chartData.stakes = _.sortByAll(
      // Start by reversing the stakes so last person in becomes first
      chartData.stakes.reverse(),

      // Now sorts:

      // First, all Option Pools go to the end (latest option pools go last)
      function(s) {
        return s.stake.isOptionsPool ? 1 + s.stake.round.sequenceI : 0;
      },

      // Then common behind preferred
      function(s) {
        return s.stake.shareClass === ShareClass.COMMON ? 1 : 0;
      },

      // Then liquidation seniority
      function(s) {
        return -1 * s.stake.liquidationSeniority || 0;
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
      }
    };


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
                roundStats: p.xRoundStats,
                exitStats: p.exitStats || null
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
        formatter: CURRENCY_FORMATTER,
        domain: [
          0,
          Math.floor( _(allDataPoints).pluck('value').max() ) // floor to get rid of .00000001 floating point glitches
        ]
      },

      percentage: {
        formatter: PERCENTAGE_FORMATTER,
        domain: [
          0,
          Math.min( _(allDataPoints).pluck('percentage').max(), 1 ) // make sure never past 100%, eg 1.00000002
        ]
      }
    };

    // Axis Lock.  Keep the axes the max seen since the last time the axis lock was enabled.
    var axisLimits = this.state.percentValueConfigAxisLimits; // convenience alias
    axisLimits.value[0] = Math.min(axisLimits.value[0], percentValueConfig.axes.value.domain[0]);
    axisLimits.value[1] = Math.max(axisLimits.value[1], percentValueConfig.axes.value.domain[1]);
    axisLimits.percentage[0] = Math.min(axisLimits.percentage[0], percentValueConfig.axes.percentage.domain[0]);
    axisLimits.percentage[1] = Math.max(axisLimits.percentage[1], percentValueConfig.axes.percentage.domain[1]);
    axisLimits.lastValueDomain = percentValueConfig.axes.value.domain;
    axisLimits.lastPercentageDomain = percentValueConfig.axes.percentage.domain;

    if (this.state.percentValueConfigAxisLimits.axisLock) {
      percentValueConfig.axes.value.domain = axisLimits.value;
      percentValueConfig.axes.percentage.domain = axisLimits.percentage;
    }

    window.hdRoundChartConfig = roundChartConfig;
    this.state.roundChartConfig = roundChartConfig;

    window.hdPercentValueConfig = percentValueConfig;
    this.state.percentValueConfig = percentValueConfig;

    this.emitState(opts);
  },

  onSelectMeasure: function(measureName, opts) {
    this.state.selectedMeasure = measureName;

    this.emitState(opts);
  },

  onSelectRound: function(newRound, opts) {
    if (this.state.selectedRound === newRound)
      return;

    this.state.selectedRound = newRound;
    this.emitState(opts);
  },

  resetAxisLock: function() {
    this.state.percentValueConfigAxisLimits.value      = [Infinity, -Infinity];
    this.state.percentValueConfigAxisLimits.percentage = [Infinity, -Infinity];
    this.state.percentValueConfig.axes.value.domain      = this.state.percentValueConfigAxisLimits.lastValueDomain;
    this.state.percentValueConfig.axes.percentage.domain = this.state.percentValueConfigAxisLimits.lastPercentageDomain;
  },

  onSetAxisLock: function() {
    this.state.percentValueConfigAxisLimits.axisLock = true;
    this.resetAxisLock();
    this.emitState();
  },

  onClearAxisLock: function() {
    this.state.percentValueConfigAxisLimits.axisLock = false;
    this.resetAxisLock();
    this.emitState();
  },

  emitState: function(opts) {
    this.trigger(_.clone(this.state), opts);
  }
});
