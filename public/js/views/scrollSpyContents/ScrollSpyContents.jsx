var React = require('react');
var Reflux = require('reflux');

var Begin = require('jsx!views/scrollSpyContents/Begin.jsx');
var StartAVenture = require('jsx!views/scrollSpyContents/StartAVenture.jsx');
var SeedDilute = require('jsx!views/scrollSpyContents/SeedDilute.jsx');
var SeedDiluteWithOptions = require('jsx!views/scrollSpyContents/SeedDiluteWithOptions.jsx');
var SeedValue  = require('jsx!views/scrollSpyContents/SeedValue.jsx');
var SeriesA    = require('jsx!views/scrollSpyContents/SeriesA.jsx');
var SeriesB    = require('jsx!views/scrollSpyContents/SeriesB.jsx');
var SeriesC    = require('jsx!views/scrollSpyContents/SeriesC.jsx');
var DownRound  = require('jsx!views/scrollSpyContents/DownRound.jsx');
var Exit       = require('jsx!views/scrollSpyContents/Exit.jsx');
var LiquidationPreferencesExit = require('jsx!views/scrollSpyContents/LiquidationPreferencesExit.jsx');
var UnderwaterOptionsExit = require('jsx!views/scrollSpyContents/UnderwaterOptionsExit.jsx');

module.exports = React.createClass({
  render() {
    return (
      <div id="scenarios">
        <Begin />

        <StartAVenture />

        <SeedDilute />

        <SeedDiluteWithOptions />

        <SeedValue />

        <SeriesA />

        <SeriesB />

        <SeriesC />

        <DownRound />

        <Exit />

        <LiquidationPreferencesExit />

        <UnderwaterOptionsExit />
      </div>
    )
  }
});