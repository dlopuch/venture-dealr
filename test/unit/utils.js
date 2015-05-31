exports.NAMEIFY_STAKES = function NAMEIFY_STAKES(stakeAndPercentage) {
  stakeAndPercentage.stake = stakeAndPercentage.stake.name;
};

/**
 * 0.2 !== 0.20000000000000000001 as far as assertions are concerned, but it basically is.
 *
 * Turns float percentages into *1000 integers for "close enough" (eg 0.2... -> 200)
 *
 * @param {Object} stakeAndPercentage
 */
exports.DEFLOAT_STAKES = function DEFLOAT_STAKES(stakeAndPercentage) {
  stakeAndPercentage.percentage = Math.round(stakeAndPercentage.percentage * 1000);
};