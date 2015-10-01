var React = require('react');

var PercentValueScatter = require('views/charts/PercentValueScatter');

module.exports = React.createClass({
  mixins: [
  ],

  shouldComponentUpdate() {
    // Let D3 scripts and bootstrap plugins manage the dom
    return false;
  },

  componentDidMount() {
    window.percentValueScatter = new PercentValueScatter( React.findDOMNode(this.refs.percentEquityScatter) );
  },

  render() {
    return (
      <svg id="percent-equity-scatter" ref="percentEquityScatter" className="percent-equity-scatter" width="300" height="250"></svg>
    );
  }
});