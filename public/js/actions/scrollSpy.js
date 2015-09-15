var Reflux = require('reflux');

module.exports = Reflux.createActions([

  /**
   * Triggered when a new ScrollSpy.jsx has been mounted for first time and needs js initialization
   * @param {string} domId
   */
  'mounted',

  /**
   * Triggered when a new ScrollSpy.jsx has been re-rendered with new dom and the plugin needs to be refreshed
   * @param {string} domId
   */
  'refreshed',

  /**
   * A scrollspy target has come into focus
   * @param {string} domId The domID of the target (no #, eg 'target-id')
   */
  'targetTriggered',

  /**
   * When the DOM contains a new element to scrollspy against
   * @param {string} domId The ID of the scrollable item (no #)
   * @param {string} name The display name of the target
   */
  'registerTarget'
]);
