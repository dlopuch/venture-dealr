var _ = require('lodash');
var assert = require('chai').assert;

var RoundStore = require('stores/RoundStore');

describe('RoundStore', function() {
  describe('.generateChartSeries()', function() {
    it('generates for a 3-round enterprise', function() {
      // Note: the numbers in this scenario were tested in RoundTest
      var models = require('../_scenarios/foundingSeedSeriesA')();

      var chartData = RoundStore._generateChartSeries(models.seriesARound);

      assert.isNotNull(chartData.rounds, 'Expected x-axis series');
      assert.equal(chartData.rounds.length, 3, 'Expected three rounds');

      assert.isNotNull(chartData.stakes, 'Expected measure containers');
      assert.equal(chartData.stakes.length, 4 + 3 + 3, 'Expected three rounds worth of equity series');

      assert.deepEqual(_.pluck(chartData.rounds, 'round'),
        [models.foundingRound, models.seedRound, models.seriesARound],
        'Rounds references not correct'
      );

      assert.deepEqual(_.pluck(chartData.stakes, 'stake'),
        [
          models.founder1Equity,
          models.founder2Equity,
          models.founder3Equity,
          models.foundingRound.roundOptionsPoolEquity,

          models.investmentS1.equityStake,
          models.investmentS2.equityStake,
          models.seedRound.roundOptionsPoolEquity,

          models.investmentA1.equityStake,
          models.investmentA2.equityStake,
          models.seriesARound.roundOptionsPoolEquity,
        ],
        "Equity buckets' equity references not correct."
      );


      // When an equity holding didn't exist for a given round, it should have a null in the measure timeline
      // ie all measures should be the same length as the number of rounds, and gaps should be filled in with nulls
      var IS_NULL = true;
      var nullsByStakeAndRound = [
        // founding round stakes
        [false  , false  , false],
        [false  , false  , false],
        [false  , false  , false],
        [false  , false  , false],

        // seed round stakes
        [IS_NULL, false  , false],
        [IS_NULL, false  , false],
        [IS_NULL, false  , false],

        // series A round stakes
        [IS_NULL, IS_NULL, false],
        [IS_NULL, IS_NULL, false],
        [IS_NULL, IS_NULL, false]
      ];
      ['percentages', 'values'].forEach(function(accessor) {
        _.pluck(chartData.stakes, accessor)
        .forEach(function(stakeMeasure, stakeI) {
          var stake = chartData.stakes[stakeI].stake;

          assert.equal(stakeMeasure.length, chartData.rounds.length,
            "Expected ." + accessor + " for stake '" + stake.name + "' to have same length as num rounds"
          );

          stakeMeasure.forEach(function(value, roundI) {
            var whereAmI = "." + accessor + "[" + roundI + "] on '" + chartData.stakes[stakeI].stake.name + "'";

            // Check measure has number or null for .n
            if (nullsByStakeAndRound[stakeI][roundI]) {
              assert.isNull(value.n, 'Expected null for ' + whereAmI);
            } else if (nullsByStakeAndRound[stakeI][roundI] === false) {
              assert.isNumber(value.n, 'Expected a number for ' + whereAmI);
            } else {
              assert.fail("Nulls mask doesn't spec expectation for " + whereAmI);
            }


            // Check other linkages
            assert.strictEqual(value.yStake, stake, whereAmI + ': Stake link not correct');

            assert.equal(value.x, value.xRound.id, whereAmI + ": x-value should be the round's ID");
            assert.strictEqual(value.xRound, chartData.rounds[roundI].round,
              whereAmI + ': Round link not correct');
            assert.strictEqual(value.xRoundStats, chartData.rounds[roundI].stats,
              whereAmI + ': Round stats link not correct');

          });
        });
      });

    });
  });

});
