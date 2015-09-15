var _ = require('lodash');
var React = require('react');
var Reflux = require('reflux');

var ScrollSpyContentsMixin = require('views/scrollSpy/ScrollSpyContentsMixin');

var SCROLLSPY_PROPS = {
  id: 'scenario-',
  name: ''
}

module.exports = React.createClass({
  mixins: [ScrollSpyContentsMixin],

  getInitialState() {
    return {
      scrollSpy: SCROLLSPY_PROPS
    };
  },

  onScrollSpyTriggered: function(target) {
    console.log('HEYDAN ' + SCROLLSPY_PROPS.id + ' triggered!');
  },

  render() {
    return (
      <div id={SCROLLSPY_PROPS.id}>
        <h1></h1>
        <p></p>
      </div>
    );
  }
});