var _ = require('lodash');
var d3 = require('d3');

var ChartStore = require('stores/ChartStore');

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

      colorScale: null
    };

    this._svg = {
      xAxis: svg.append('g')
        .classed('x axis', true)
        .attr("transform", "translate(" + opts.margin.left + "," + (opts.margin.top + opts.chartArea.height) + ")"),

      yAxis: svg.append('g')
        .classed('y axis', true)
        .attr("transform", "translate( "+ opts.margin.left + "," + opts.margin.top + ")"),

      chartArea: svg.append('g')
        .classed('chart-canvas', true)
        .attr("transform", "translate(" + opts.margin.left + "," + (opts.margin.top + opts.chartArea.height) + ")" +
              " scale(1, -1)") // flip y-axis to y-is-up instead of svg's y-is-down
    };

    ChartStore.on('roundTimelineData', this.handleRoundTimelineData.bind(this));

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

  handleRoundTimelineData(data) {
    this._components.colorScale = d3.scale.category10().domain( _.pluck(data.datasets.percentages.series, 'id') );

    this._renderXAxis(data.xAxis);
    this._renderYAxis(data.datasets.percentages.yAxis);
    this._renderData(data.datasets.percentages);
  }

  _renderData(measure) {
    var seriesG = this._svg.chartArea.selectAll('g')
      .data(measure.series)
    .enter().append('g');

    var self = this;

    var width = this._components.xScale.rangeBand() * 0.8;

    seriesG.selectAll('rect')
      .data((d, i) => d.data)
    .enter().append('rect')
    .style('fill', function() {
      return self._components.colorScale( d3.select(this.parentNode).datum().id );
    })
    .attr('x', d => this._components.xScale(d.x) + this._components.xScale.rangeBand() / 2 - width/2 )
    .attr('y', d => this._components.yScale(d.y0) )
    .attr('width', width)
    .attr('height', d => d.y ? this._components.yScale(d.y) : 0);

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
      .range([0, this.opts.chartArea.height]);

    this._components.yOutputScale = d3.scale.linear()
      .domain(yAxis.domain.slice().reverse())
      .range([0, this.opts.chartArea.height]);

    this._components.yAxis.scale( this._components.yOutputScale );
    this._svg.yAxis.call(this._components.yAxis);
  }


}

module.exports = Chart;
