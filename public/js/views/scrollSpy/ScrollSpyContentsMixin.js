/**
 * Mixin to be used on components that need to be ScrollSpy-able
 *
 * Components using this need to provide the following attribute in component state (eg via getInitialState()):
 *   scrollSpy: {Object} like:
 *     id: {string} DOM ID of the spy target (no #)
 *     name: {string} friendly display name of the spy target
 *
 * As the scroll-spied elements comes in and out of focus, this mixin sets and clears `state.scrollSpy.isFocused`.
 * Use the state to render focus.
 *
 * Components may also implement optional implementation hooks:
 *   this.onScrollSpyFocus(): called when the spy is focused
 *   this.onScrollSpyUnfocus(): called when the spy is no longer in focus
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
    // Different target, unfocus
    if (targetId !== this.state.scrollSpy.id) {

      // Do stuff only if previously focused
      if (this.state.scrollSpy.isFocused) {
        this.state.scrollSpy.isFocused = false;
        this.setState({
          scrollSpy: this.state.scrollSpy
        });

        if (this.onScrollSpyUnfocus)
          this.onScrollSpyUnfocus();
      }

    // Matches this target, focus
    } else {

      // Do stuff only if previously not focused
      if (!this.state.scrollSpy.isFocused) {
        this.state.scrollSpy.isFocused = true;
        this.setState({
          scrollSpy: this.state.scrollSpy
        });

        if (this.onScrollSpyFocus)
          this.onScrollSpyFocus();
      }
    }
  }

};
