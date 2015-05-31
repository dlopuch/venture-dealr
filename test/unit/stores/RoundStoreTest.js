var _ = require('lodash');
var assert = require('chai').assert;

var RoundStore = require('stores/RoundStore');

describe('RoundStore', function() {
  describe('.generateChartSeries()', function() {
    it('generates for a 3-round enterprise', function() {
      // Note: the numbers in this scenario were tested in RoundTest
      var models = require('../_scenarios/foundingSeedSeriesA')();

      var chartData = RoundStore.generateChartSeries(models.seriesARound);

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
      nullsByStakeAndRound.forEach(function(nullMask, stakeI) {
        nullMask.forEach(function(maskValue, roundI) {
          if (maskValue) {
            assert.isNull(chartData.stakes[stakeI].percentages[roundI],
              "Expected null for .percentage[" + roundI + "] on stake '" + chartData.stakes[stakeI].stake.name + "'"
            );
            assert.isNull(chartData.stakes[stakeI].values[roundI],
              "Expected null for .values[" + roundI + "] on stake '" + chartData.stakes[stakeI].stake.name + "'"
            );

          } else {
            assert.isNumber(chartData.stakes[stakeI].percentages[roundI],
              "Expected number for .percentage[" + roundI + "] on stake '" + chartData.stakes[stakeI].stake.name + "'"
            );
            assert.isTrue(
              chartData.stakes[stakeI].percentages[roundI] <= 1 && chartData.stakes[stakeI].percentages[roundI] >= 0,
              ".percentage[" + roundI + "] on stake '" + chartData.stakes[stakeI].stake.name + "' is not a percentage!"
            );

            assert.isNumber(chartData.stakes[stakeI].values[roundI],
              "Expected number for .values[" + roundI + "] on stake '" + chartData.stakes[stakeI].stake.name + "'"
            );
          }
        });
      });

      // Finally, all measures must be the same length as the x-axis
      chartData.stakes.forEach(function(s) {
        assert.equal(s.percentages.length, chartData.rounds.length,
          "Expected .percentages measure length to equal x-axis length for stake '" + s.stake.name + "'"
        );

        assert.equal(s.values.length, chartData.rounds.length,
          "Expected .values measure length to equal x-axis length for stake '" + s.stake.name + "'"
        );
      });

    });
  });

});
