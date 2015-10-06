var d3 = require('d3');
var _ = require('lodash');

var storyScenarios = window.scenarios = require('models/storyScenarios');

// Various subcomponents require bootstrap js, but bootstrap needs jquery on global scope.
// Bring it all in before anything starts up.
window.jQuery = window.$ = require('jquery/dist/jquery.min');
var bootstrap = require('bootstrap');

require('less/index.less');

window.onload = function() {

  // Analytics (available only on gh-pages branch)
  window.mixpanel = window.mixpanel || {
    track: function() { },
    identify: function() {}
  };
  window.ga = window.ga || function() { console.log.apply(console, ['GA'].concat(arguments)); };
  window.mixpanel.identify('Rando ' + Math.random());


  // Non-react js init
  // ---------
  $('#datahero').tooltip();


  // flux
  var RoundStore = window.RoundStore = require('stores/RoundStore');
  var ChartStore = window.ChartStore = require('stores/ChartStore');
  var scrollSpyStore = window.scrollSpyStore = require('stores/scrollSpyStore');


  var actions = window.actions = require('actions/actionsEnum');


  var EquityStake = window.EquityStake = require('models/EquityStake');
  var Round       = window.Round       = require('models/Round');
  var Investment  = window.Investment  = require('models/Investment');
  var Exit        = window.Exit        = require('models/Exit');


  actions.round.setScenario(storyScenarios.rounds.demoExit);



  require('views/reactApp.jsx');
  require('views/headerAffixSpy');

  if (window.console && window.console.warn) {
    window.console.warn('Hello, Hacker. Wanna see something fun? Scroll back to the top then:');
    window.console.warn('  > actions.round.changeRoundPreMoneyValuation(scenarios.rounds.demoSeriesC, 500000000)');
    window.console.warn('or if you want a windfall,');
    window.console.warn('  > actions.exit.changeValuation(scenarios.rounds.demoExit , 5000000000)');
    window.console.warn('Now go enjoy the full source at https://github.com/dlopuch/venture-dealr');
  }

};
