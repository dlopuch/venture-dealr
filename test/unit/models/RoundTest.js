var _ = require('lodash');
var assert = require('chai').assert;

var Round = require('models/Round');
var EquityStake = require('models/EquityStake');
var Investment = require('models/Investment');
var ShareClass = require('models/ShareClass');

var NAMEIFY_STAKES = function(stakeAndPercentage) { stakeAndPercentage.stake = stakeAndPercentage.stake.name; };

/**
 * 0.2 !== 0.20000000000000000001 as far as assertions are concerned, but it basically is.
 *
 * Turns float percentages into *100 integers for "close enough".
 *
 * @param {Object} stakeAndPercentage
 */
var DEFLOAT_STAKES = function(stakeAndPercentage) {
   stakeAndPercentage.percentage = Math.round(stakeAndPercentage.percentage * 100);
};

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

    var round1 = new Round('Seed', round0, 10000);    // 10k pre

    var investment1a = new Investment(round1, 10000); // + 10k
    var investment1b = new Investment(round1, 20000); // + 20k

    var stats = round1.calculateStats();              // = 25%, 25%, and 50%

    assert.deepEqual(stats, {
      numSharesPostMoney   : 4000,
      preMoney             : 10000,
      postMoney            : 40000,
      roundMoney           : 30000,
      sharePrice           : 10,
      stakesAndPercentages : [
        {stake: round1.roundOptionsPoolEquity, percentage: 0},
        {stake: investment1b.equityStake,      percentage: 0.5},
        {stake: investment1a.equityStake,      percentage: 0.25},
        {stake: round0.roundOptionsPoolEquity, percentage: 0},
        {stake: stake3,                        percentage: 0.25 * 0.2},
        {stake: stake2,                        percentage: 0.25 * 0.3},
        {stake: stake1,                        percentage: 0.25 * 0.5}
      ]
    }, 'Round 1 stats incorrect!');
  });
});

describe('Round w/ Options Pool', function() {

  var round;

  beforeEach(function() {
    round = new Round('Founding', null, 0, {type: 'post', percent: 0.25});
  });

  it('creates its option pool shares only after initial stats calc', function() {
    var stake0 = new EquityStake(round, 750);
    assert.isNull(round.roundOptionsPoolEquity);
    round.calculateStats();
    assert.isNotNull(round.roundOptionsPoolEquity);
    assert.isTrue(round.roundOptionsPoolEquity instanceof EquityStake, 'Should be an EquityStake');
    assert.isTrue(round.roundOptionsPoolEquity.round === round, 'Option pool round should be creating round');
  });

  it("doesn't allow more than one option pool", function() {
    var stake0 = new EquityStake(round, 750);
    round.calculateStats();
    assert.isNotNull(round.roundOptionsPoolEquity);

    try {
      var badStake = new EquityStake(round, 249, {shareClass: ShareClass.COMMON, isOptionsPool: true});
      assert.fail('Expected unreachable code');
    } catch (e) {
      assert.equal(e.message, 'Cannot add option pool -- round already has one');
    }
  });

  it('calculates option pool stats properly for founding round', function() {
    // Founding round option pools are calculated by percentage

    var stake0 = new EquityStake(round, 750);
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

  it('calculates option pool stats properly for an investment round', function() {
    // Investment round option pools are calculated by share price
    // Numbers based on http://venturehacks.com/articles/option-pool-shuffle
    //   6M effective pre-money
    //   + 2M investment
    //   + 20% "post financing fully diluted capitalization" options pool

    var foundingRound  = new Round('Founding', null, 0, {type: 'post', percent: 0.0}); // null-case: no founding pool
    var founderEquity = new EquityStake(foundingRound, 1000, {name: 'founder stake'});

    var seedRound = new Round('Seed', foundingRound, 8000000, {type: 'post', percent: 0.20}); // 8M (inc 2M shuffle) pre
    var investment1 = new Investment(seedRound, 1000000, {name: '1M investment a'}); // + 2M
    var investment2 = new Investment(seedRound, 1000000, {name: '1M investment b'});

    var stats = seedRound.calculateStats();

    _(stats.stakesAndPercentages).forEach(NAMEIFY_STAKES).forEach(DEFLOAT_STAKES).value();

    assert.deepEqual(stats, {
      numSharesPostMoney: 1666.6666666666665, // TODO: decimal shares aren't really a thing
      preMoney: 8000000,
      roundMoney: 2000000,
      postMoney: 10000000,
      sharePrice: 6000,
      stakesAndPercentages: [
        { stake: 'Options Pool for Seed round'            , percentage: 20 }, // from round terms
        { stake: 'Stake from investment "1M investment b"', percentage: 10 }, // 1M / (6M + 2M pool + 2M investment)
        { stake: 'Stake from investment "1M investment a"', percentage: 10 },
        { stake: 'Options Pool for Founding round'        , percentage: 0 },
        { stake: 'founder stake'                          , percentage: 60 },
      ]
    });

  });

  it.skip('calculates option pool stats properly for an investment round after founding round', function() {
    assert.fail('TODO');
    // TODO: This will especially fail if prev rounds don't calculateStats(), so they don't create their option pools
    //       Put in backwards calculation check (based on dirtyness)
  });
});
