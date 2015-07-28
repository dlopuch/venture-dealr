var Round = require('models/Round');
var EquityStake = require('models/EquityStake');
var Investment = require('models/Investment');
var ShareClass = require('models/ShareClass');


// do the scenario:
module.exports = function doIt() {

  var foundingRound  = new Round('Founding', null, 0, {type: 'post', percent: 0.25});
  var founder1Equity = new EquityStake(foundingRound, 750, {name: 'founder stakes'});

  // Seed Round (w/ 'option pool shuffle')
  //   6M effective pre
  //   2M option pool
  //   10M post
  //   (6/10 dilution for founding equities)
  var seedRound = new Round('Seed', foundingRound, 8000000, {type: 'post', percent: 0.20});
  var investmentS1 = new Investment(seedRound    , 2000000, {name: '2M seed'});

  var seriesARound = new Round('Series A', seedRound, 20000000, {type: 'post', percent: 0.10});
  var investmentA1 = new Investment(seriesARound    , 10000000, {name: '10M series A'});

  return {

    foundingRound  : foundingRound  ,
    founder1Equity : founder1Equity ,

    seedRound      : seedRound      ,
    investmentS1   : investmentS1   ,

    seriesARound   : seriesARound   ,
    investmentA1   : investmentA1
  };
};
