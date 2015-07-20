var _ = require('lodash');
var d3 = require('d3');

var ChartStore = require('stores/ChartStore');

var DEFAULT_TRANSITION_MS = 1000;

module.exports = class PercentValueScatter {
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

    // margin convention: http://bl.ocks.org/mbostock/3019563
    svg = svg.append('g')
      .attr('transform', 'translate(' + opts.margin.left + ', ' + opts.margin.top + ')');

    var svgW = parseInt(this.svg.attr('width'), 10);
    var svgH = parseInt(this.svg.attr('height'), 10);

    if (!svgW || !svgH)
      throw new Error('Invalid svg specified -- must have w and h');

    this.opts.chartArea = _.defaults(opts.chartArea || {}, {
      width: svgW - opts.margin.left - opts.margin.right,
      height: svgH - opts.margin.top - opts.margin.bottom
    });

    this._components = {
      xScale: d3.scale.linear().range([0, opts.chartArea.width]),
      xAxis: d3.svg.axis().tickSize(3).tickPadding(6).orient('bottom'),

      yScale: d3.scale.linear().range([opts.chartArea.height, 0]),
      yAxis: d3.svg.axis().tickSize(3).tickPadding(6).orient('left'),
    };

    this._svg = {
      xAxis: svg.append('g').classed('x axis', true)
        .attr('transform', 'translate(0, ' + opts.chartArea.height + ')'),

      yAxis: svg.append('g').classed('y axis', true),

      chartArea: svg.append('g').classed('chart-canvas', true)
    };

    ChartStore.on(ChartStore.EVENTS.PERCENT_VALUE_SCATTER_DATA, this.handleData.bind(this));
  }

  handleData(chartConfig) {
    this._data = chartConfig;
    this._renderXAxis(chartConfig.axes.percentage);
    this._renderYAxis(chartConfig.axes.value);
    this._renderData(chartConfig.series);
  }

  _renderData(series) {
    var seriesG = this._svg.chartArea.selectAll('g.series')
      .data(series, d => '' + d.stake.id);

    var seriesGEnter = seriesG.enter().append('g')
      .classed('series', true)
      .attr('data-stake', d => d.stake.name);

    this._renderPaths(seriesG, seriesGEnter);
    this._renderMarkers(seriesG, seriesGEnter);

    seriesG.exit()
    .transition()
      .duration(DEFAULT_TRANSITION_MS)
    .attr('opacity', 0)
    .remove();
  }

  _renderMarkers(seriesG, seriesGEnter) {
    var markersG = seriesGEnter
    .append('g')
      .classed('markers', true);

    var circles = seriesG.selectAll('g.markers')
    .datum(function(d) {
      // make sure we get the latest data from parent
      return d3.select(this.parentElement).datum();
    })
    .selectAll('circle')
    .data(function(d) {
      return d.data;
    });

    var self = this;

    circles.enter()
    .append('circle')
    .attr({
      r: 3,
      cx: d => (self._components.prevXScale || self._components.xScale)(d.percentage),
      cy: d => (self._components.prevYScale || self._components.yScale)(d.value),
      fill: function(d) {
        return d3.select(this.parentElement).datum().color;
      },
      opacity: 0
    });

    circles
    .transition()
      .duration(DEFAULT_TRANSITION_MS)
    .attr({
      opacity: 1,
      cx: d => self._components.xScale(d.percentage),
      cy: d => self._components.yScale(d.value),
      fill: function(d) {
        return d3.select(this.parentElement).datum().color;
      }
    });

    circles.exit()
    .transition()
      .duration(DEFAULT_TRANSITION_MS/4)
    .attr({
      opacity: 0
    })
    .remove();
  }

  /**
   * Updates and animates paths in the scatter
   * @param {d3.selection} seriesG selection of G's bound to series data
   * @param {d3.selection} seriesGEnter the seriesG enter selection (new g's that were just created)
   */
  _renderPaths(seriesG, seriesGEnter) {
    function makeLineGenerator(xScale, yScale) {
      if (!xScale || !yScale)
        return null;

      return d3.svg.line()
        .x(d => xScale(d.percentage))
        .y(d => yScale(d.value));
    }
    var lineGenerator         = makeLineGenerator(this._components.xScale    , this._components.yScale);
    var prevGridLineGenerator = makeLineGenerator(this._components.prevXScale, this._components.prevYScale);


    var serieDToPathD = (serieD => serieD.data);


    seriesGEnter
    // for new series, create the paths:
    .append('path')

      // make each path's datum the list of x/y points:
      .datum(serieDToPathD)

      .attr({
        'd': d => (prevGridLineGenerator || lineGenerator)( d ),
        'fill': 'none',
        'stroke': function(d) {
          return d3.select(this.parentElement).datum().color;
        },
        'stroke-width': '2px',
        'opacity': 0
      });

    // for existing paths, update their positions to new grid
    seriesG.selectAll('path')
    .each(function deriveNewDatum(initialD) {
      // Because the path was appended from the g, it inherited the g's data.
      // But data inheritence does not propagate on data update, so the paths' data is stale.
      // We need to get the new data from the parent element, but we also need to do some padding magic to make
      // animations smooth (D3 can only animate path segments that have the same number of segments, so we make some
      // false segments to always have a constant number of segments)

      // First, get the new data:
      var realNewD = serieDToPathD( d3.select(this.parentElement).datum() );

      var paddedInitialD = initialD;
      var paddedNewD = _.clone(realNewD);

      // To make the path transition smooth, we need to have the same number of line segements.  Pad appropriately.

      if (initialD.length < realNewD.length) {
        while (paddedInitialD.length < paddedNewD.length) {
          // pad with last element
          paddedInitialD.push( paddedInitialD[paddedInitialD.length - 1] );
        }

      } else if (realNewD.length < initialD.length) {
        while (paddedNewD.length < paddedInitialD.length) {
          paddedNewD.push( paddedNewD[paddedNewD.length - 1] );
        }
      }

      // save both new derived datasets as the element's datum
      d3.select(this).datum({
        initialD: paddedInitialD,
        newD    : paddedNewD
      });
    })
    .attr('d', function updateToExistingGrid(d) {
      // Before we start the animation, we need to update the path to have the number of segments in the
      // newly padded data.  We do this against the previous grid to initialize the transition into the new grid.

      if (!prevGridLineGenerator)
        return d3.select(this).attr('d'); // no-op on first-load

      return prevGridLineGenerator( d.initialD );
    })
    .each(function updateToNewDatum(d) {
      // Okay, the transition is initialized.  Change to just the new data.
      d3.select(this).datum( d.newD );
    })

    // Now that the existing paths have the same number of segments as the new paths, we can animate
    .transition()
      .duration(DEFAULT_TRANSITION_MS)
    .attr({
      'd': d => lineGenerator(d),
      'stroke': function(d) {
        // note: color may change as rounds are added, so update
        return d3.select(this.parentElement).datum().color;
      },
      'opacity': 1
    });
  } //done with paths

  _renderXAxis(xAxisConfig) {
    if (this._notFirstXScale) {
      // copy the previous one for pre-transition updates
      this._components.prevXScale = this._components.xScale.copy();
    }
    this._notFirstXScale = true;

    this._components.xScale
    .domain( xAxisConfig.domain.slice().reverse() )
    .nice(5);

    this._components.xAxis
    .scale( this._components.xScale )
    .tickFormat(xAxisConfig.formatter)
    .ticks(5);

    this._svg.xAxis.transition().duration(DEFAULT_TRANSITION_MS).call( this._components.xAxis );
  }

  _renderYAxis(yAxisConfig) {
    if (this._notFirstYScale) {
      // copy the previous one for pre-transition updates
      this._components.prevYScale = this._components.yScale.copy();
    }
    this._notFirstYScale = true;

    this._components.yScale
    .domain( yAxisConfig.domain )
    .nice(5);

    this._components.yAxis
    .scale( this._components.yScale )
    .tickFormat(yAxisConfig.formatter)
    .ticks(5);

    this._svg.yAxis.transition().duration(DEFAULT_TRANSITION_MS).call( this._components.yAxis );
  }
};
