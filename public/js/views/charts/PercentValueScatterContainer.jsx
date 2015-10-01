var React = require('react');
var Reflux = require('reflux');

var actions = require('actions/actionsEnum');

var PercentValueScatterSVG = require('views/charts/PercentValueScatterSVG.jsx');

module.exports = React.createClass({
  mixins: [
  ],

  // shouldComponentUpdate() {
//
  // },

  componentDidMount() {
    window.pvs = this;

    this.props.promisePVScatterRendered.resolve();
  },

  getInitialState() {
    return {
      offStage: true
    };
  },

  render() {
    return (
      <div className={'svg-container ' + (this.state.offStage ? 'off-stage' : '')}>
        <PercentValueScatterSVG />
      </div>
    );
  }
});