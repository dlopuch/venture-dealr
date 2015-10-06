var React = require('react');
var Reflux = require('reflux');

var actions = require('actions/actionsEnum');
var uiStore = require('stores/uiStore');

var PercentValueScatterSVG = require('views/charts/PercentValueScatterSVG.jsx');

module.exports = React.createClass({
  mixins: [
    Reflux.connect(uiStore, 'ui')
  ],

  componentDidMount() {
    this.props.promisePVScatterRendered.resolve();
  },

  getInitialState() {
    return {
      ui: uiStore.INITIAL_STATE
    };
  },

  render() {
    return (
      <div className={'hidden-no-pvs-width svg-container ' + (this.state.ui.hidePVScatter ? 'off-stage' : '')}>
        <PercentValueScatterSVG />
      </div>
    );
  }
});