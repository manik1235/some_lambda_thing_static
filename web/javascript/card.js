export class Card {
  /*
   *
   * var card = new Card('2d');
   *
   * card.name == '2d';
   * card.rank == '2';
   * card.suit == 'd';
   * card.magnitude == 2;
   * card.stats == { name: '2c', rank: 2, suit: d, magnitude: [2] }
   *
   */
  constructor(name, options = { rankStart: 0, rankEnd: 1, suitStart: 1, suitEnd: 2 }) {
    this.name = name;
    this.options = options;
  }

  get stats() {
    return { name: this.name, rank: this.rank, suit: this.suit, magnitude: this.magnitude };
  }

  get rank() {
    return this.name.slice(options.rankStart, options.rankEnd);
  }

  get suit() {
    return this.name.slice(options.suitStart, options.suitEnd);
  }

  get magnitude() {
    var magnitude = this._transforms[this.rank];

    if (magnitude) {
      return magnitude;
    } else {
      return [parseInt(this.rank)];
    }

    return magnitude;
  }

  get _transforms() {
    // This should probably come from lambda
    var transform = {
      'A': [1, 14]
      ,'K': [13]
      ,'Q': [12]
      ,'J': [11]
      ,'T': [10]
    }

    return transform;
  }
}
