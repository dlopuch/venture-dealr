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

  actions.round.setScenario(storyScenarios.rounds.founding);

  // Add a demo b round at 30M pre
  var bRound = new Round('B round', window.scenario.seriesARound, 30000000, {type: 'post', percent: 0.05});
  var bInvestment1 = window.bInvestment1 = new Investment(bRound, 20000000, {name: '20M series B'});
  window.bRound = bRound;


  // Add a demo exit at 50M
  var exit = window.exit = new Exit(bRound, 50000000);


  var toggleIsPercent = true;
  d3.select('#toggle_measure').on('click', function() {
    toggleIsPercent = !toggleIsPercent;

    actions.chart.selectMeasure(toggleIsPercent ? 'percentages' : 'values');
  });

  var explainBRound = _.once(function() {
    console.log('bRound enabled!');
    console.log('Now try changing some valuations, eg:');
    console.log('  > actions.round.changeRoundPreMoneyValuation(bRound, 40000000)');
    console.log('or see the effects of a down-round:');
    console.log('  > actions.round.changeRoundPreMoneyValuation(scenario.seriesARound, 5000000)');
    console.log('or see the effects of more funding:');
    console.log('  > actions.investment.changeMoney(bInvestment1, 30000000)');
    console.log('or add an exit:');
    console.log('  > actions.round.setScenario(exit);');
    console.log('or change exit amount:');
    console.log('  > actions.exit.changeValuation(exit, 60000000);');
  });
  var toggleBRound = false;
  d3.select('#toggle_b_round').on('click', function() {
    toggleBRound = !toggleBRound;

    actions.round.setScenario( toggleBRound ? bRound : window.scenario.seriesARound );

    explainBRound();
  });


  require('views/reactApp.jsx');
  require('views/chartsAffixSpy');

};
