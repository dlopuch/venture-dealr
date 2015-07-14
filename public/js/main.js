var d3 = require('d3');
var _ = require('lodash');

window.onload = function() {
  var Chart = require('./Chart');
  window.chart = new Chart('#round-chart');

  var PercentValueScatter = require('./PercentValueScatter');
  window.percentValueScatter = new PercentValueScatter('#percent-equity-scatter');

  console.log('heydan success!');


  // flux
  var RoundStore = window._RoundStore = require('stores/RoundStore');
  var ChartStore = window._ChartStore = require('stores/ChartStore');


  var dispatcher = require('dispatcher');
  var ACTIONS = require('actions/actionsEnum');
  window.roundActions = require('actions/roundActions');
  window.investmentActions = require('actions/investmentActions');
  window.chartActions = require('actions/chartActions');


  var EquityStake = window.EquityStake = require('models/EquityStake');
  var Round       = window.Round = require('models/Round');
  var Investment  = window.Investment = require('models/Investment');


  window.scenario = require('../../test/unit/_scenarios/foundingSeedSeriesA')();

  window.roundActions.setScenario(window.scenario.seriesARound);

  // Add a demo b round at 30M pre
  var bRound = new Round('B round', window.scenario.seriesARound, 30000000, {type: 'post', percent: 0.05});
  var bInvestment1 = window.bInvestment1 = new Investment(bRound, 20000000, {name: 'b investment 1'});
  window.bRound = bRound;


  var toggleIsPercent = true;
  d3.select('#toggle_measure').on('click', function() {
    toggleIsPercent = !toggleIsPercent;

    window.chartActions.selectMeasure(toggleIsPercent ? 'percentages' : 'values');
  });

  var explainBRound = _.once(function() {
    console.log('bRound enabled!');
    console.log('Now try changing some valuations, eg:');
    console.log('  > roundActions.changeRoundPreMoneyValuation(bRound, 40000000)');
    console.log('or see the effects of a down-round:');
    console.log('  > roundActions.changeRoundPreMoneyValuation(scenario.seriesARound, 5000000)');
    console.log('or see the effects of more funding:');
    console.log('  > investmentActions.changeMoney(bInvestment1, 30000000)');
  });
  var toggleBRound = false;
  d3.select('#toggle_b_round').on('click', function() {
    toggleBRound = !toggleBRound;

    window.roundActions.setScenario( toggleBRound ? bRound : window.scenario.seriesARound );

    explainBRound();
  });

};
