var d3 = require('d3');
var _ = require('lodash');

var storyScenarios = window.scenarios = require('models/storyScenarios');

require('less/index.less');

window.onload = function() {

  // flux
  var RoundStore = window.RoundStore = require('stores/RoundStore');
  var ChartStore = window.ChartStore = require('stores/ChartStore');
  var scrollSpyStore = window.scrollSpyStore = require('stores/scrollSpyStore');

  var actions = window.actions = require('actions/actionsEnum');


  var EquityStake = window.EquityStake = require('models/EquityStake');
  var Round       = window.Round       = require('models/Round');
  var Investment  = window.Investment  = require('models/Investment');
  var Exit        = window.Exit        = require('models/Exit');

  var promiseChartReady = require('views/reactDemoReel.jsx');

  var origBPreMoney;
  var origCPreMoney;
  var origExit;
  var demos = [
    {
      title: 'The Founding',
      actions: () => {
        actions.chart.showFirstRoundLabels(true);
        actions.chart.selectMeasure('percentages');
        actions.round.setScenario(storyScenarios.rounds.founding);
        d3.select('#supertitle').style({opacity: 1});
      },
      waitFor: 3000
    },
    {
      title: 'Seed Investments',
      actions: () => {
        storyScenarios.actions.makeSeedNoOptions();
        actions.round.setScenario(storyScenarios.rounds.seed);
      }
    },
    {
      title: 'Option Pools',
      actions: () => {
        actions.round.setScenario(storyScenarios.rounds.seed);
        storyScenarios.actions.makeSeedHaveOptions();
      }
    },
    {
      title: 'Valuations',
      actions: () => {
        actions.chart.selectMeasure('values');
        actions.round.setScenario(storyScenarios.rounds.seed);
      }
    },
    {
      title: 'Funding Rounds',
      actions: () => {
        actions.chart.showFirstRoundLabels(false);
        actions.round.setScenario(storyScenarios.rounds.seriesA);
      },
      waitFor: 1000
    },
    {
      title: 'Funding Rounds',
      actions: () => actions.round.setScenario(storyScenarios.rounds.seriesB),
      waitFor: 1000
    },
    {
      title: 'Funding Rounds',
      actions: () => actions.round.setScenario(storyScenarios.rounds.seriesC)
    },
    {
      title: 'Dilution',
      actions: () => {
        actions.chart.selectMeasure('percentages');
      }
    },
    {
      title: 'Down Rounds',
      actions: () => {
        actions.chart.selectMeasure('values');
      },
      waitFor: 1000
    },
    {
      title: 'Down Rounds',
      actions: () => {
        origBPreMoney = storyScenarios.rounds.seriesB.preMoneyValuation;
        actions.round.changeRoundPreMoneyValuation(storyScenarios.rounds.seriesB, 6000000);
      }
    },
    {
      title: 'Exits',
      actions: () => {
        actions.round.changeRoundPreMoneyValuation(storyScenarios.rounds.seriesB, origBPreMoney);
        actions.round.setScenario(storyScenarios.rounds.exit);
      }
    },
    {
      title: 'Liquidation Preferences',
      actions: () => {
        origCPreMoney = storyScenarios.rounds.seriesC.preMoneyValuation;
        origExit = storyScenarios.rounds.exit.valuation;
        actions.round.changeRoundPreMoneyValuation(storyScenarios.rounds.seriesC, 40000000);
        actions.exit.changeValuation(storyScenarios.rounds.exit, 12500000);
      },
      waitFor: 1000
    },
    {
      title: 'Liquidation Preferences',
      actions: () => actions.exit.changeValuation(storyScenarios.rounds.exit, 28000000),
      waitFor: 1000
    },
    {
      title: 'Liquidation Preferences',
      actions: () => actions.exit.changeValuation(storyScenarios.rounds.exit, 33000000),
      waitFor: 1000
    },
    {
      title: 'Liquidation Preferences',
      actions: () => actions.exit.changeValuation(storyScenarios.rounds.exit, 37000000),
      waitFor: 1000
    },
    {
      title: 'Liquidation Preferences',
      actions: () => actions.exit.changeValuation(storyScenarios.rounds.exit, 65000000),
      waitFor: 1000
    },
    {
      title: 'Liquidation Preferences',
      actions: () => actions.exit.changeValuation(storyScenarios.rounds.exit, 75000000),
      waitFor: 1000
    },
    {
      title: 'Liquidation Preferences',
      actions: () => actions.exit.changeValuation(storyScenarios.rounds.exit, 90000000),
      waitFor: 1000
    },
    {
      title: 'Liquidation Preferences',
      actions: () => actions.exit.changeValuation(storyScenarios.rounds.exit, 104000000),
    },
    {
      title: 'And the Moonshots',
      actions: () => {
        actions.round.changeRoundPreMoneyValuation(storyScenarios.rounds.seriesC, origCPreMoney);
        actions.exit.changeValuation(storyScenarios.rounds.exit, 1000000000);
        d3.select('#supertitle').style({opacity: 0});
      },
      waitFor: 5000
    },
    {
      title: 'And the Moonshots',
      actions: () => {
        actions.exit.changeValuation(storyScenarios.rounds.exit, origExit);
      },
      waitFor: 1
    }

  ];

  promiseChartReady.then( () => {
    actions.round.setScenario(storyScenarios.rounds.demoExit);

    var i = 0;
    window.cycle = true;
    window.doNextScene = function doNextScene() {
      if (!window.cycle)
        return;

      var demo = demos[i % demos.length];

      console.log('Triggering: ', demo.title);
      actions.demo.newDemoTitle(demo.title);
      demo.actions();
      i++;

      setTimeout(doNextScene, demo.waitFor || 2000);
    };
    setTimeout(window.doNextScene);
  });

};