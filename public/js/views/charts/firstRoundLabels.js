var _ = require('lodash');

var DEFAULT_TRANSITION_MS = 1000;

/**
 * Extension to RoundChart that draws a label for each series' first round
 *
 * @param {Object} measure Measure currently being rendered
 * @param {boolean} hideLabels True to turn off all round labels.  Any present will gracefully exit (with appropriate
 *    transition) and no new ones will be created, saving DOM animation cycles
 * @param {d3.select} seriesG The series selection
 */
exports.drawFirstRoundLabels = function(measure, hideLabels, seriesG) {

  var firstRoundLabels = seriesG.selectAll('g.first-round-label')
    .data(
      function(d) {
        // want to create one text element at the first non-null y value
        return [ _.find(d.data, datum => datum.y !== null) ];
      },
      d => '' + d.id
    );

  // Only create new ones if we're not trying to hide everything
  if (!hideLabels) {
    var firstRoundLabelsEnter = firstRoundLabels.enter().append('g')
      .classed('first-round-label', true)
      .style({
        'opacity': 0,
        'fill': d => d.yStake.shareClass === 'common' && !d.yStake.isOptionsPool ? '#eee' : '#222'
      })
      .attr({
        'transform': function(d) {
          return 'translate(' +
            (this._components.xScale(d.x) + this._getBarGutter() + 10) +
            ', ' +
            this._components.yScale(0) +
            //(this._components.yScale(d.y0) - (d.y ? this._components.yHeightScale(d.y) / 2 : 0)) +
            ')';
        }.bind(this)
      });

    var faGlyphs = firstRoundLabelsEnter.append('text')
      .attr({
        'text-anchor': 'left',
      });

    faGlyphs.append('tspan')
      .classed('fa', true)
      .html('&#xf067') // .fa-plus
      .attr({
        'dominant-baseline': 'middle',
        'y': '-10px',
      })
      .style({
        'font-size': '20px'
      });

    faGlyphs.append('tspan')
      .classed('fa', true)
      .attr({
        'dominant-baseline': 'middle',
        'y': '0'
      })
      .style({
        'font-size': '40px'
      })
      .html(function(d) {
        if (d.yStake.isOptionsPool || d.yStake.fromOptionsPool) {
          return '&#xf1ae'; // .fa-child
        } else if (d.yStake.investment) {
          return '&#xf27e'; // .fa-black-tie
        } else {
          return Math.random() > 0.5 ? '&#xf183' : '&#xf182'; // .fa-male or .fa-female
        }

      });

    var firstRoundLabelsText = firstRoundLabelsEnter.append('text')
      .attr({
        'text-anchor': 'left',
        'x': '55px'
      });


    firstRoundLabelsText.append('tspan')
      .attr({
        'dominant-baseline': 'middle',
        'dy': '-1.1em',
      })
      .text(function(d) {
        return d.yStake.name;
      });

    firstRoundLabelsText.append('tspan')
      .classed('series-value', true)
      .attr({
        'dominant-baseline': 'middle',
        'dy': '0.9em',
        'x': '55px'
      })
      .style({
        'font-size': '20px',
        'font-weight': 200
      });
      // text filled in on update
  }

  // Update text of series values
  firstRoundLabels.selectAll('tspan.series-value')
  .text(function() {
    // ignore the function d, that's stale because it was bound at create-time.
    // Look at the g.first-round-glyph parent to get latest data (from data join)
    var d = this.parentElement.parentElement.__data__;
    return measure.yAxis.formatter(d.n) + ' equity';
  });


  firstRoundLabels
  .transition()
    .duration(DEFAULT_TRANSITION_MS)
  .attr({
    'transform': function(d) {
      return 'translate(' +
        (this._components.xScale(d.x) + this._getBarGutter() + 10) +
        ', ' +
        (this._components.yScale(d.y0) - (d.y ? this._components.yHeightScale(d.y) / 2 : 0)) +
        ')';
    }.bind(this)
  })
  .style({
    'opacity': d => hideLabels ? 0 : (d.n ? 1 : 0)
  })
  .call(function(selection) {
    if (!hideLabels)
      return;

    selection.remove();
  });


  firstRoundLabels.exit().remove();
  seriesG.exit().selectAll('g.first-round-label').remove();

  return firstRoundLabels;
};
