var d3 = require('d3');
var _ = require('lodash');

var storyScenarios = require('models/storyScenarios');

// Various subcomponents require bootstrap js, but bootstrap needs jquery on global scope.
// Bring it all in before anything starts up.
window.jQuery = window.$ = require('jquery/dist/jquery.min');
var bootstrap = require('bootstrap');

require('less/index.less');

window.onload = function() {
  var RoundChart = require('./RoundChart');
  window.roundChart = new RoundChart('#round-chart');

  var PercentValueScatter = require('./PercentValueScatter');
  window.percentValueScatter = new PercentValueScatter('#percent-equity-scatter');


  // flux
  var RoundStore = window.RoundStore = require('stores/RoundStore');
  var ChartStore = window.ChartStore = require('stores/ChartStore');
  var scrollSpyStore = window.scrollSpyStore = require('stores/scrollSpyStore');


  var actions = window.actions = require('actions/actionsEnum');


  var EquityStake = window.EquityStake = require('models/EquityStake');
  var Round       = window.Round       = require('models/Round');
  var Investment  = window.Investment  = require('models/Investment');
  var Exit        = window.Exit        = require('models/Exit');



  window.scenario = require('../../test/unit/_scenarios/simpleFoundingSeedSeriesA')();

  // Add a demo b round at 30M pre
  var bRound = new Round('B round', window.scenario.seriesARound, 30000000, {type: 'post', percent: 0.05});
  var bInvestment1 = window.bInvestment1 = new Investment(bRound, 20000000, {name: '20M series B'});
  window.bRound = bRound;

  // Add a demo exit at 50M
  var exit = window.exit = new Exit(bRound, 50000000);



  actions.round.setScenario(storyScenarios.rounds.demoExit);
  //actions.chart.selectMeasure('values');



  require('views/reactApp.jsx');
  require('views/chartsAffixSpy');

};
