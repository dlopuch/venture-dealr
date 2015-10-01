var React = require('react');
var Reflux = require('reflux');

var actions = require('actions/actionsEnum');

var PercentValueScatterContainer = require('views/charts/PercentValueScatterContainer.jsx');
var RoundChart = require('views/charts/RoundChart');

module.exports = React.createClass({
  mixins: [
  ],

  shouldComponentUpdate() {
    // Let D3 scripts and bootstrap plugins manage the dom
    return false;
  },

  componentDidMount() {

    // Affix-spy for charts
    // ------------------
    var $headerAffixBar = $('#header-affix-bar'); // index.html
    var $chartsContainer = $( React.findDOMNode(this.refs.chartsContainer) );

    $chartsContainer
    .affix({
      offset: {
        top: $chartsContainer.position().top - $headerAffixBar.height()
      }
    })
    .on('affixed.bs.affix', function() {
      $chartsContainerSpacer.css('display', '');
    })
    .on('affixed-top.bs.affix', function() {
      $chartsContainerSpacer.css('display', 'none');
    });

    // The spacer has the same height of the affixing container.  It swaps in and out to take its height when it
    // affixes in and out so other things flow correctly.
    var $chartsContainerSpacer = $( React.findDOMNode(this.refs.chartsContainerSpacer) ).css({
      height: $chartsContainer.height(),

      // Need to set initial display to correct state after affix() plugin instantiated
      display: $chartsContainer.hasClass('affix') ? '' : 'none',
    });

    // Instantiate Charts
    // ---------------
    window.roundChart = new RoundChart( React.findDOMNode(this.refs.roundChart) );


    this.props.promiseRoundChartRendered.resolve();

  },

  getInitialState() {
    return {

    };
  },

  render() {
    return (
      <div>
        <div id="charts-container" ref="chartsContainer">
          <svg id="round-chart" ref="roundChart" className="round-chart" width="700" height="250"></svg>
          <PercentValueScatterContainer promisePVScatterRendered={this.props.promisePVScatterRendered} />
        </div>
        <div id="charts-container-affix-spacer" ref="chartsContainerSpacer" style={{display: 'none'}}></div>
      </div>
    );
  }
});