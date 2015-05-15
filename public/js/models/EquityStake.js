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
   *   [isOptionsPool]: {boolean} This equity stake is equity out of the options pool.
   *   [fromInvestment]: {models.Investment} If this was calculated from money, the Investment
   */
  constructor(round, numShares, shareClass=ShareClass.COMMON, opts={}) {
    if (!round)
      throw new Error('Round required');

    // TODO: Other places calc num shares.  Eventually change all to whole
    //numShares = parseInt(numShares, 10);

    if (!numShares)
      throw new Error('number of shares required');

    if (!shareClass)
      throw new Error('shareClass required');

    this.id = 'stake_' + (id++);

    this.round = round;
    round.addStake(this);

    this.numShares = numShares;
    this.shareClass = shareClass;
    this.isOptionPool = !!opts.isOptionPool;

    if (opts.fromInvestment) {
      this.investment = opts.fromInvestment;
    }

    this.opts = opts;
  }
}

module.exports = EquityStake;
