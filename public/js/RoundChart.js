/**
 * Chart showing percentage or value of EquityStakes by Round.
 *
 * Grabs data from ChartStore's `roundTimelineData` event
 */

var _ = require('lodash');
var d3 = require('d3');

var actions = require('actions/actionsEnum');
var ChartStore = require('stores/ChartStore');

var DEFAULT_TRANSITION_MS = 1000;

class Chart {
  constructor(svgSelector='svg', opts={}) {
    var svg = this.svg = d3.select(svgSelector);

    if (!svg[0][0])
      throw new Error('Invalid svg specified');

    this.opts = opts = _.defaults(opts, {
      margin: {
        left: 60,
        right: 10,
        bottom: 20,
        top: 10
      }
    });

    var svgW = parseInt(this.svg.attr('width'), 10);
    var svgH = parseInt(this.svg.attr('height'), 10);

    if (!svgW || !svgH)
      throw new Error('Invalid svg specified -- must have w and h');

    this.opts.chartArea = _.defaults(opts.chartArea || {}, {
      width: svgW - opts.margin.left - opts.margin.right,
      height: svgH - opts.margin.top - opts.margin.bottom
    });

    this._components = {
      xScale: null,
      xAxis: d3.svg.axis().tickSize(3).tickPadding(6).orient('bottom'),
      yScale: null,
      yAxis: d3.svg.axis().tickSize(3).tickPadding(6).orient('left'),
    };

    this._svg = {
      chartArea: svg.append('g')
        .classed('chart-canvas', true)
        .attr("transform", "translate(" + opts.margin.left + "," + (opts.margin.top + opts.chartArea.height) + ")" +
              " scale(1, -1)"), // flip y-axis to y-is-up instead of svg's y-is-down

      xAxis: svg.append('g')
        .classed('x axis', true)
        .attr("transform", "translate(" + opts.margin.left + "," + (opts.margin.top + opts.chartArea.height) + ")"),

      yAxis: svg.append('g')
        .classed('y axis', true)
        .attr("transform", "translate( "+ opts.margin.left + "," + opts.margin.top + ")"),

      tooltipContainer: svg.append('g')
        .classed('chart-tooltip', true)
    };

    this._svg.tooltipText = this._svg.tooltipContainer.append('text').style('font-weight', 'bold');

    // bind this context to function self args
    this.positionTooltip = _.partial(this.positionTooltip, this);
    this.hideTooltip     = _.partial(this.hideTooltip, this);
    this._doHideTooltip  = _.partial(this._doHideTooltip, this);

    // ChartStore.on(ChartStore.EVENTS.ROUND_TIMELINE_DATA, this.handleRoundTimelineData.bind(this));
    // ChartStore.on(ChartStore.EVENTS.MEASURE_SELECTED   , this.handleSelectMeasure.bind(this));
    // ChartStore.on(ChartStore.EVENTS.ROUND_SELECTED     , this.handleRoundSelected.bind(this));

    ChartStore.listen(this.onNewChartData.bind(this));

    // Example load
    // this.handleRoundTimelineData({
      // xAxis: {
        // domain: d3.range(4),
        // range: ['a', 'b', 'c', 'd']
      // },
      // yAxis: {
        // domain: [0, 100]
      // }
    // });

  }

  positionTooltip(self, d) {
    if (!d.yStake)
      return; // skip if not hovering over a series bar

    // clear hide timer
    if (self._hideTooltipTimeout) {
      clearTimeout(self._hideTooltipTimeout);
      delete self._hideTooltipTimeout;
    }


    var mouseXY = d3.mouse(self.svg[0][0]);

    self._svg.tooltipText
    .attr('x', mouseXY[0] + 10)
    .attr('y', mouseXY[1] - 10)
    .text(d.yStake.name)
    .transition().duration(100).style('opacity', 1);
  }

  hideTooltip(self) {
    clearTimeout(self._hideTooltipTimeout);
    self._hideTooltipTimeout = setTimeout(self._doHideTooltip, 200);
  }

  _doHideTooltip(self) {
    self._svg.tooltipText
    .transition().duration(200)
    .style('opacity', 0);
  }

  onNewChartData(chartStoreState) {
    var newData = chartStoreState.roundChartConfig;

    var hasNewData = false;
    if (newData && this._data !== newData) {
      this._data = newData;
      hasNewData = true;
    }

    var hasNewMeasure = false;
    if (this._measure !== chartStoreState.selectedMeasure) {
      this._measure = chartStoreState.selectedMeasure;
      hasNewMeasure = true;
    }

    if (!hasNewData && !hasNewMeasure)
      return; // nothing to update, ignore

    if (hasNewData) {
      this._renderXAxis(newData.xAxis);
    }

    var measureData = this._data.datasets[ chartStoreState.selectedMeasure ];
    this._renderYAxis(measureData.yAxis);
    this._renderData(measureData);
  }


  _renderData(measure) {
    var seriesG = this._svg.chartArea.selectAll('g')
      .data(measure.series, d => '' + d.id);

    seriesG.enter().append('g');

    var self = this;

    var barWidth = this._components.xScale.rangeBand() * 0.8;

    // each seriesG now has a list of values at each round.  Make a subselection to turn those into chart glyphs, keying
    // each subselection node to it's round ID
    var rects = seriesG.selectAll('rect')
      .data(
        d => d.data,
        d => '' + d.xRound.id
      );

    // Initialize all new series
    rects.enter().append('rect')
      .attr({
        'width': barWidth,
        'x': d => this._components.xScale(d.x) + this._components.xScale.rangeBand() / 2 - barWidth/2,

        'height': 0,
        'y': 0
      })
      .style('fill', function(d) {
        // color is in the parent g's datum
        return d3.select(this.parentElement).datum().color;
      })
      .on('mouseover', this.positionTooltip)
      .on('mousemove', this.positionTooltip)
      .on('mouseout', this.hideTooltip)
      .on('mouseover', d => actions.chart.selectRound(d.xRound));


    // Update position and size of existing rectangles from previous rounds (or new ones created)
    rects.transition()
      .duration(DEFAULT_TRANSITION_MS)
      .style('fill', function(d) {
        // color is in the parent g's datum
        return d3.select(this.parentElement).datum().color;
      })
      .attr({
        'width': barWidth,
        'x': d => this._components.xScale(d.x) + this._components.xScale.rangeBand() / 2 - barWidth/2,

        'height': d => d.y ? this._components.yScale(d.y) : 0,
        'y': d => this._components.yScale(d.y0)
      });


    // Remove existing series' rectangles from rounds no longer present
    function removeBars(selection) {
      selection
      .transition()
        .duration(DEFAULT_TRANSITION_MS)
      .attr({
        'height': 0,
        'y': 0
      })
      .remove();
    }

    rects.exit().call(removeBars);

    // But we may have series that exited too (series introduced by new rounds we have removed)
    // Select those and do same exit animation
    seriesG.exit().selectAll('rect').call(removeBars);



    // ----------------------
    // Now similar pattern for lines indicating whether each block is a valuation or round money
    var typeLines = seriesG.selectAll('line')
      .data(
        d => d.data,
        d => '' + d.xRound.id
      );

    var lineXPositioner = d => this._components.xScale(d.x) + this._components.xScale.rangeBand() / 2 - barWidth/2 - 3;

    typeLines.enter().append('line')
      .attr({
        'x1': lineXPositioner,
        'x2': lineXPositioner,
        'y1': 0,
        'y2': 0,
        'class': function(d) {
          var originRound = d.yStake.round === d.xRound;

          if (originRound && d.yStake.isOptionsPool) {
            return 'round-type round-valuation round-options';
          } else if (originRound) {
            return 'round-type round-money';
          } else {
            return 'round-type round-valuation';
          }
        },

        // If there's 0-value (eg founding round), don't show the type lines
        style: d => d.xRoundStats.postMoney ? '' : 'display: none;'
      });

    typeLines
    .transition()
      .duration(DEFAULT_TRANSITION_MS)
    .attr({
      'x1': lineXPositioner,
      'x2': lineXPositioner,
      'y1': d => d.y ? this._components.yScale(d.y0) : 0,
      'y2': d => d.y ? this._components.yScale(d.y0 + d.y) : 0,
    });

    function removeLines(selection) {
      selection
      .transition()
        .duration(DEFAULT_TRANSITION_MS)
      .attr({
        'y1': 0,
        'y2': 0
      })
      .remove();
    }
    typeLines.exit().call(removeLines);

    // But we may have series that exited too (series introduced by new rounds we have removed)
    // Select those and do same exit animation
    seriesG.exit().selectAll('line').call(removeLines);

  }

  _renderXAxis(xAxis) {
    this._components.xScale = d3.scale.ordinal()
      .domain(xAxis.domain)
      .rangeRoundBands([0, this.opts.chartArea.width], 0.08);

    this._components.xOutputScale = d3.scale.ordinal()
      .domain(xAxis.range) // axis uses range (ie outputs) of config's xScale.  Range is internal conversion.
      .rangeRoundBands([0, this.opts.chartArea.width], 0.08);

    this._components.xAxis.scale( this._components.xOutputScale );
    this._svg.xAxis.call(this._components.xAxis);
  }

  _renderYAxis(yAxis) {
    // yScale is normal, but yOutputScale is reversed because we've applied a -1*y transform on y chart area to make
    // easier to work with
    this._components.yScale = d3.scale.linear()
      .domain(yAxis.domain)
      .range([0, this.opts.chartArea.height])
      .nice();

    this._components.yOutputScale = d3.scale.linear()
      .domain(yAxis.domain.slice().reverse())
      .range([0, this.opts.chartArea.height])
      .nice();

    this._components.yAxis.scale( this._components.yOutputScale );
    this._svg.yAxis.transition().duration(DEFAULT_TRANSITION_MS).call(this._components.yAxis);
  }


}

module.exports = Chart;
