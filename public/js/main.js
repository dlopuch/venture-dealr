window.onload = function() {
  var Chart = require('./Chart');

  window.chart = new Chart('svg');

  console.log('heydan success!');


  // flux
  var dispatcher = require('app/dispatcher');
  var ACTIONS = require('app/actions/actionsEnum');
  var RoundStore = require('app/stores/RoundStore');


  var EquityStake = window.EquityStake = require('app/models/EquityStake');
  var Round       = window.Round = require('app/models/Round');
  var Investment  = window.Investment = require('app/models/Investment');

  var round0 = window.round0 = new Round('Founding', null, 0);
  //var investment = window.investment = new Investment(round0, 10);
  var stake0 = window.stake0 = new EquityStake(round0, 500);
  var stake1 = window.stake1 = new EquityStake(round0, 250);
  var stake2 = window.stake2 = new EquityStake(round0, 250);

  var round0Stats = window.round0Stats = round0.calculateStats();
  console.log('round0 stats:', round0Stats);

  var round1 = window.round1 = new Round('Seed', round0, 10000);         // pre-money: 10k
  var investment1 = window.investment1 = new Investment(round1, 10000);  // investment 1: 10k
  var investment2 = window.investment2 = new Investment(round1, 20000);  // investment 2: 20k

  var round1Stats = window.round1Stats = round1.calculateStats();        // investment1 and 2's equity are 25 and 50%,
  console.log('round1 stats:', round1Stats);                             // remaining sum to 25%

};
