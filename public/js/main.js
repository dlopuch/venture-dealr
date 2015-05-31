window.onload = function() {
  var Chart = require('./Chart');

  window.chart = new Chart('svg');

  console.log('heydan success!');


  // flux
  var dispatcher = require('dispatcher');
  var ACTIONS = require('actions/actionsEnum');
  var RoundStore = window.RoundStore = require('stores/RoundStore');


  var EquityStake = window.EquityStake = require('models/EquityStake');
  var Round       = window.Round = require('models/Round');
  var Investment  = window.Investment = require('models/Investment');

  window.foundingRound  = new Round('Founding', null, 0, {type: 'post', percent: 0.25});
  window.founder1Equity = new EquityStake(window.foundingRound, 250, {name: 'founder 1 stake 25%'});
  window.founder2Equity = new EquityStake(window.foundingRound, 250, {name: 'founder 2 stake 25%'});
  window.founder3Equity = new EquityStake(window.foundingRound, 250, {name: 'founder 3 stake 25%'});

  window.seedRound = new Round('Seed', window.foundingRound, 8000000, {type: 'post', percent: 0.20});
  window.investment1 = new Investment(window.seedRound     , 1000000, {name: '1M investment a'});
  window.investment2 = new Investment(window.seedRound     , 1000000, {name: '1M investment b'});

  window.seriesARound = new Round('Series A', window.seedRound, 20000000, {type: 'post', percent: 0.10});
  window.investment1 = new Investment(window.seriesARound     ,  5000000, {name: '5M investment c'});
  window.investment2 = new Investment(window.seriesARound     ,  5000000, {name: '5M investment d'});

  var stats = window.seriesARound.calculateStats(); // also calculates previous round stats


  window.scenario = require('../../test/unit/_scenarios/foundingSeedSeriesA');

};
