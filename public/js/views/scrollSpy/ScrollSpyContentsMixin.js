/**
 * Mixin to be used on components that need to be ScrollSpy-able
 *
 * Components using this need to provide the following attribute in component state (eg via getInitialState()):
 *   scrollSpy: {Object} like:
 *     id: {string} DOM ID of the spy target (no #)
 *     name: {string} friendly display name of the spy target
 *
 * Components may also implement an optional implementation hook:
 *   this.onScrollSpyTriggered(): called when the spy is triggered
 */

var Reflux = require('reflux');
var actions = require('actions/actionsEnum');

module.exports = {
  mixins: [
    Reflux.listenTo(actions.scrollSpy.targetTriggered, '_onScrollSpyTargetTriggered')
  ],

  componentDidMount: function() {
    if (!this.state || !this.state.scrollSpy)
      throw new Error('[ScrollSpyContentsMixin] must assign scrollSpy props to this.state (use getInitialState())');

    if (!this.state.scrollSpy.id || !this.state.scrollSpy.name)
      throw new Error('[ScrollSpyContentsMixin] Invalid .scrollSpy state!');

    actions.scrollSpy.registerTarget( this.state.scrollSpy.id, this.state.scrollSpy.name );
  },

  _onScrollSpyTargetTriggered: function(targetId) {
    if (targetId !== this.state.scrollSpy.id)
      return;

    if (this.onScrollSpyTriggered)
      this.onScrollSpyTriggered();
  }

};
