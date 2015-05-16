var assert = require('chai').assert;

var Round = require('models/Round');
var EquityStake = require('models/EquityStake');
var Investment = require('models/Investment');
var ShareClass = require('models/ShareClass');

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
        {stake: round0.roundOptionsPoolEquity, percentage: 0},
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
        {stake: round1.roundOptionsPoolEquity, percentage: 0},
        {stake: investment1b.equityStake,      percentage: 0.5},
        {stake: investment1a.equityStake,      percentage: 0.25},
        {stake: stake3,                        percentage: 0.25 * 0.2},
        {stake: stake2,                        percentage: 0.25 * 0.3},
        {stake: stake1,                        percentage: 0.25 * 0.5}
      ]
    }, 'Round 1 stats incorrect!');
  });
});

describe('Round w/ Equity Pool', function() {

  var round, stake0;

  beforeEach(function() {
    round = new Round('Founding', null, 0, {type: 'post', percent: 0.25});

    stake0 = new EquityStake(round, 750);
  });

  it('creates its option pool shares only after initial stats calc', function() {
    assert.isNull(round.roundOptionsPoolEquity);
    round.calculateStats();
    assert.isNotNull(round.roundOptionsPoolEquity);
    assert.isTrue(round.roundOptionsPoolEquity instanceof EquityStake, 'Should be an EquityStake');
    assert.isTrue(round.roundOptionsPoolEquity.round === round, 'Option pool round should be creating round');
  });

  it("doesn't allow more than one option pool", function() {
    round.calculateStats();
    assert.isNotNull(round.roundOptionsPoolEquity);

    try {
      var badStake = new EquityStake(round, 249, ShareClass.COMMON, {isOptionsPool: true});
      assert.fail('Expected unreachable code');
    } catch (e) {
      assert.equal(e.message, 'Cannot add option pool -- round already has one');
    }
  });

  it('calculates option pool stats properly for founding round', function() {
    var stats = round.calculateStats();
    assert.isNotNull(round.roundOptionsPoolEquity);

    assert.deepEqual(stats, {
      numSharesPostMoney: 1000,
      preMoney: 0,
      roundMoney: 0,
      postMoney: 0,
      sharePrice: null,
      stakesAndPercentages: [
        { stake: round.roundOptionsPoolEquity , percentage: 0.25 },
        { stake: stake0                       , percentage: 0.75 }
      ],
    });

    // now make sure options pool updates when doubling the equity shares
    var stake1 = new EquityStake(round, 750);
    stats = round.calculateStats();

    assert.deepEqual(stats, {
      numSharesPostMoney: 2000,  // 2000 - 750 - 750 = 500.  500 / 2000 = 25%, so this should be as expected.
      preMoney: 0,
      roundMoney: 0,
      postMoney: 0,
      sharePrice: null,
      stakesAndPercentages: [
        { stake: stake1                       , percentage: 0.75 / 2 },
        { stake: round.roundOptionsPoolEquity , percentage: 0.25 }, // options pool keeps same percentage
        { stake: stake0                       , percentage: 0.75 / 2 }
      ],
    });
    assert.equal(round.roundOptionsPoolEquity.numShares, 500, 'Expected 25% to be 500 shares.');
  });

  it.skip('calculates option pool stats properly for an investment round', function() { assert.fail('TODO'); });

  it.skip('calculates option pool stats properly for an investment round after founding round', function() {
    assert.fail('TODO');
    // TODO: This will especially fail if prev rounds don't calculateStats(), so they don't create their option pools
    //       Put in backwards calculation check (based on dirtyness)
  });
});
