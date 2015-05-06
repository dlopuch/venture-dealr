var _ = require('lodash');
var d3 = require('d3');

class Chart {
  constructor(svgSelector='svg', opts={}) {
    var svg = this.svg = d3.select(svgSelector);

    if (!svg[0][0])
      throw new Error('Invalid svg specified');

    this.opts = opts = _.defaults(opts, {
      margin: {
        left: 40,
        right: 10,
        bottom: 20,
        top: 10
      }
    });

    var svgW = parseInt(this.svg.attr('width'), 10);
    var svgH = parseInt(this.svg.attr('height'), 10);

    if (!svgW || !svgH)
      throw new Error('Invalid svg specified -- must have w and h');

    opts.chartArea = _.defaults(opts.chartArea || {}, {
      width: svgW - opts.margin.left - opts.margin.right,
      height: svgH - opts.margin.top - opts.margin.bottom
    });

    svg.append('g')
    .classed('chart-canvas', true)
    .attr("transform", "translate(" + opts.margin.left + "," + opts.margin.top + ")");

    var x = d3.scale.ordinal()
      .domain(d3.range(4))
      .rangeRoundBands([0, opts.chartArea.width], 0.08);

    var xAxis = d3.svg.axis()
      .scale(x)
      .tickSize(0)
      .tickPadding(6)
      .orient("bottom");

    svg.append('g')
    .classed('x axis', true)
    .attr("transform", "translate(" + opts.margin.left + "," + (opts.margin.top + opts.chartArea.height) + ")")
    .call(xAxis);

    svg.append('g')
    .classed('y axis', true)
    .attr("transform", "translate(0," + opts.margin.top + ")");
  }


}

module.exports = Chart;
