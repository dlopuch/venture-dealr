var Round = require('models/Round');
var EquityStake = require('models/EquityStake');
var Investment = require('models/Investment');
var ShareClass = require('models/ShareClass');


// do the scenario:
module.exports = function doIt() {

  var foundingRound  = new Round('Founding', null, 0, {type: 'post', percent: 0.25});
  var founder1Equity = new EquityStake(foundingRound, 250, {name: 'founder 1 stake 25%'});
  var founder2Equity = new EquityStake(foundingRound, 250, {name: 'founder 2 stake 25%'});
  var founder3Equity = new EquityStake(foundingRound, 250, {name: 'founder 3 stake 25%'});

  // Seed Round (w/ 'option pool shuffle')
  //   6M effective pre
  //   2M option pool
  //   10M post
  //   (6/10 dilution for founding equities)
  var seedRound = new Round('Seed', foundingRound, 8000000, {type: 'post', percent: 0.20});
  var investmentS1 = new Investment(seedRound    , 1000000, {name: '1M investment a'});
  var investmentS2 = new Investment(seedRound    , 1000000, {name: '1M investment b'});

  var seriesARound = new Round('Series A', seedRound, 20000000, {type: 'post', percent: 0.10});
  var investmentA1 = new Investment(seriesARound    ,  5000000, {name: '5M investment c'});
  var investmentA2 = new Investment(seriesARound    ,  5000000, {name: '5M investment d'});

  return {

    foundingRound  : foundingRound  ,
    founder1Equity : founder1Equity ,
    founder2Equity : founder2Equity ,
    founder3Equity : founder3Equity ,

    seedRound      : seedRound      ,
    investmentS1   : investmentS1   ,
    investmentS2   : investmentS2   ,

    seriesARound   : seriesARound   ,
    investmentA1   : investmentA1   ,
    investmentA2   : investmentA2
  };
};
