var actions = require('actions/actionsEnum');

var Round = require('models/Round');
var EquityStake = require('models/EquityStake');
var Investment = require('models/Investment');
var Exit = require('models/Exit');

// We need to do some complex naming here for readability, shhhh jshint....
/* jshint camelcase:false */

var foundingRound  = new Round('Founding', null, 0, {type: 'post', percent: 0});
var founder1Equity = new EquityStake(foundingRound, 400, {name: 'Founder 2'});
var founder1Equity = new EquityStake(foundingRound, 600, {name: 'Founder 1'});


var seedRound = new Round('Seed', foundingRound, 8000000, {type: 'post', percent: 0.0}); // actions to make 15%
var investmentS1 = new Investment(seedRound, 2000000, {name: '2M Seed'});

var seriesARound = new Round('Series A', seedRound, 20000000, {type: 'post', percent: 0.15});
var investmentSeriesA = new Investment(seriesARound, 5000000, {name: '5M Series A'});

var seriesBRound = new Round('Series B', seriesARound, 30000000, {type: 'post', percent: 0.10});
var investmentSeriesB = new Investment(seriesBRound, 6000000, {name: '6M Series B'});

var seriesCRound = new Round('Series C', seriesBRound, 75000000, {type: 'post', percent: 0.05});
var investmentSeriesC = new Investment(seriesCRound, 25000000, {name: '25M Series C'});

var exit = new Exit(seriesCRound, 200000000);


module.exports = window.storyScenarios = {
  rounds: {
    founding : foundingRound,
    seed     : seedRound,
    seriesA  : seriesARound,
    seriesB  : seriesBRound,
    seriesC  : seriesCRound,
    exit     : exit
  },

  actions: {
    makeSeedNoOptions  : function() { actions.round.changeOptionsPoolSpec(seedRound, {type: 'post', percent: 0}); },
    makeSeedHaveOptions: function() { actions.round.changeOptionsPoolSpec(seedRound, {type: 'post', percent: 0.15});
    }
  }
};

/* jshint camelcase:true */
