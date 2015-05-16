var assert = require('chai').assert;

var Round = require('models/Round');
var EquityStake = require('models/EquityStake');
var Investment = require('models/Investment');

describe('Round', function() {
  it('instantiates', function() {
    var round0 = new Round('Founding', null, 0);
    assert.isNotNull(round0);
  });

  it('calculates founding round stakes correctly', function() {
    var round0 = new Round('Founding', null, 0);

    var stake1 = new EquityStake(round0, 500);
    var stake2 = new EquityStake(round0, 300);
    var stake3 = new EquityStake(round0, 200);

    var stats = round0.calculateStats();
    assert.deepEqual(stats, {
      numSharesPostMoney   : 1000,
      preMoney             : 0,
      postMoney            : 0,
      roundMoney           : 0,
      sharePrice           : null,
      stakesAndPercentages : [
        {stake: stake3, percentage: 0.2},
        {stake: stake2, percentage: 0.3},
        {stake: stake1, percentage: 0.5}
      ]
    }, 'Round 0 stats incorrect!');
  });

  it('calculates a simple money round correctly', function() {
    var round0 = new Round('Founding', null, 0);

    var stake1 = new EquityStake(round0, 500);
    var stake2 = new EquityStake(round0, 300);
    var stake3 = new EquityStake(round0, 200);

    var round1 = new Round('Seed', round0, 10000);    // 10k

    var investment1a = new Investment(round1, 10000); // + 10k
    var investment1b = new Investment(round1, 20000); // + 20k

    assert.deepEqual(round1.calculateStats(), {       // = 25%, 25%, and 50%
      numSharesPostMoney   : 4000,
      preMoney             : 10000,
      postMoney            : 40000,
      roundMoney           : 30000,
      sharePrice           : 10,
      stakesAndPercentages : [
        {stake: investment1b.equityStake, percentage: 0.5},
        {stake: investment1a.equityStake, percentage: 0.25},
        {stake: stake3, percentage: 0.25 * 0.2},
        {stake: stake2, percentage: 0.25 * 0.3},
        {stake: stake1, percentage: 0.25 * 0.5}
      ]
    }, 'Round 1 stats incorrect!');
  });
});
