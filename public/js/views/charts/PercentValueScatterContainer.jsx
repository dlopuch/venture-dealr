var React = require('react');
var Reflux = require('reflux');

var actions = require('actions/actionsEnum');
var uiStore = require('stores/uiStore');

var PercentValueScatterSVG = require('views/charts/PercentValueScatterSVG.jsx');

module.exports = React.createClass({
  mixins: [
    Reflux.connect(uiStore, 'ui')
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
      ui: {
        hidePVScatter: true
      }
    };
  },

  render() {
    return (
      <div className={'svg-container ' + (this.state.ui.hidePVScatter ? 'off-stage' : '')}>
        <PercentValueScatterSVG />
      </div>
    );
  }
});