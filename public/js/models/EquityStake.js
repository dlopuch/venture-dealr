var _ = require('lodash');

var ShareClass = require('./ShareClass');

var id = 1;

/**
 * Represents an equity stake introduced during a specific round
 */
class EquityStake {
  /**
   * Creates a new investment
   *
   * @param {models.Round} The round the investment was created in
   * @param {number} numShares Number of shares this round represents
   * @param {models.SHARE_CLASS} shareClass Investment Common or preferred
   * @param {Object} [opts] Additional options, including:
   *   [name]: {String} Name of the stake
   *   [shareClass]: {models.ShareClass} common or preferred.  Defaults to ShareClass.COMMON
   *   [liquidationPreference]: {number} Preferred stakes only.  Defaults to 1.
   *   [liquidationSeniority]: {number} Seniority of liquidation preference. Higher gets money out first.  Defaults to 1
   *   [isOptionsPool]: {boolean} This equity stake is equity represents the round's option pool.
   *   [fromOptionsPool]: {models.EquityStake} This equity stake was assigned out of the option pool.  If so, it
   *     represents a 'sub-equity' -- one that is not counted because it's covered by the option pool
   *   [fromInvestment]: {models.Investment} If this was calculated from money, the Investment
   */
  constructor(round, numShares, opts={}) {
    if (!round)
      throw new Error('Round required');

    // TODO: Other places calc num shares.  Eventually change all to whole
    //numShares = parseInt(numShares, 10);

    if (!_.isNumber(numShares) || numShares < 0) // (note that 0-shares IS allowed, eg empty options pool.  Odd, but ok)
      throw new Error('number of shares required');

    if (opts.fromOptionsPool) {
      if (!(opts.fromOptionsPool instanceof EquityStake))
        throw new Error('Must be from an EquityStake');

      if (!opts.fromOptionsPool.isOptionsPool)
        throw new Error('An equity from an options pool must be from an EquityStake that is an option pool');

      if (opts.fromOptionsPool.round !== round)
        throw new Error('fromOptionsPool equities must be from same round as options pool');

      if (opts.fromOptionsPool && opts.isOptionsPool)
        throw new Error('cannot be from an option pool and be the option pool at the same time!');
    }

    this.id = id++;


    this.numShares = numShares;
    this.shareClass = opts.shareClass || ShareClass.COMMON;
    this.isOptionsPool = !!opts.isOptionsPool;

    if (opts.fromInvestment) {
      this.investment = opts.fromInvestment;
    }

    this.name = opts.name ||
      (opts.fromInvestment && ('Stake from investment "' + opts.fromInvestment.name + '"')) ||
      (opts.isOptionsPool && ('Options Pool for ' + round.name + ' round')) ||
      (opts.fromOptionsPool && ('Round ' + round.name + ' options pool assignment')) ||
      ('Equity ' + this.id + ' (from ' + round.name + ' round)');

    this.opts = opts;

    if (this.shareClass === ShareClass.PREFERRED) {
      this.liquidationPreference = opts.liquidationPreference || 1;
      this.liquidationSeniority  = opts.liquidationSeniority  || 1;
    }

    this.round = round;
    round._registerStake(this);
  }
}

module.exports = EquityStake;
