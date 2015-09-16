var actions = require('actions/actionsEnum');

var Round = require('models/Round');
var EquityStake = require('models/EquityStake');
var Investment = require('models/Investment');

// We need to do some complex naming here for readability, shhhh jshint....
/* jshint camelcase:false */

var foundingRound  = new Round('Founding', null, 0, {type: 'post', percent: 0});
var founder1Equity = new EquityStake(foundingRound, 400, {name: 'Founder 2'});
var founder1Equity = new EquityStake(foundingRound, 600, {name: 'Founder 1'});


var seedRound = new Round('Seed', foundingRound, 8000000, {type: 'post', percent: 0.0}); // actions to make 15%
var investmentS1 = new Investment(seedRound, 2000000, {name: '2M Seed'});


module.exports = window.storyScenarios = {
  rounds: {
    founding: foundingRound,
    seed: seedRound
  },

  actions: {
    makeSeedNoOptions  : function() { actions.round.changeOptionsPoolSpec(seedRound, {type: 'post', percent: 0}); },
    makeSeedHaveOptions: function() { actions.round.changeOptionsPoolSpec(seedRound, {type: 'post', percent: 0.15});
    }
  }
};

/* jshint camelcase:true */
