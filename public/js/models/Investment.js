var EventEmitter = require('events').EventEmitter;

var id = 1;

module.exports = class Investment {
  /**
   * @param {models.Round} round Investment's round
   * @param {number} money Investment amount (in currency)
   */
  constructor(round, money) {
    if (!round)
      throw new Error('Round required!');

    // TODO: Specify an investment in terms of post-money percentage (changes round pre-money)

    this.id = id++;

    this.round = round;

    round.addInvestment(this);

    this.money = money;
    this.equityStake = null; // to be calculated
  }




};
