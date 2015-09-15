var React = require('react');
var Reflux = require('reflux');

var actions = require('actions/actionsEnum');

var scrollSpyStore = require('stores/scrollSpyStore');

module.exports = React.createClass({
  mixins: [
    Reflux.listenTo(scrollSpyStore, '_onStoreChange')
  ],

  propTypes: {
    domId: React.PropTypes.string.isRequired,
    // spyTargets: React.PropTypes.arrayOf( React.PropTypes.shape({
      // id: React.PropTypes.string.isRequired,
      // name: React.PropTypes.string.isRequired
    // })).isRequired
  },

  getInitialState() {
    return {
      spyTargets: []
    }
  },

  _onStoreChange(newState) {
    this.setState(newState);
  },

  componentDidMount() {
    actions.scrollSpy.mounted(this.props.domId);
  },

  componentDidUpdate() {
    actions.scrollSpy.refreshed(this.props.domId);
  },

  render() {
    return (
      <div id={this.props.domId} className='scroll-spy-navtarget'
        style={{
          position: 'fixed',
          right: 0,
          top: 350,
          width: 400
        }}
      >
        <ul className='nav nav-pills'>
          {this.state.spyTargets.map(function(target) {
            return (
              <li key={target.id}>
                <a href={'#' + target.id}>{target.name}</a>
              </li>
            )
          })}
        </ul>
      </div>
    );
  }
});