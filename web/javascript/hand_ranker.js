export class HandRanker {
  constructor(hand) {
    this.cache = {};
    this.hand = hand;
  }

  get stats() {
    var handStats = {};

    handStats.length = this.hand.length;
    handStats.cardsPerRank = this._calcCardsPerRank;
    handStats.pairs = this._calcKinds(2);
    handStats.trips = this._calcKinds(3);
    handStats.quads = this._calcKinds(4);
    handStats.cardsPerSuit = this._calcCardsPerSuit;
    handStats.runs = this._calcRuns;

    return handStats;
  }

  get _calcCardsPerRank() {
    if (this.cache._calcCardsPerRank) {
      return this.cache._calcCardsPerRank;
    }
    var cardsPerRank = {};

    for (var cardIndex in this.hand) {
      var rank = this.hand[cardIndex].slice(0, 1);
      if (cardsPerRank[rank]) {
        cardsPerRank[rank] += 1;
      } else {
        cardsPerRank[rank] = 1;
      }
    }

    this.cache._calcCardsPerRank = cardsPerRank;
    return this.cache._calcCardsPerRank;
  }

  get _calcCardsPerSuit() {
    if (this.cache._calcCardsPerRank) {
      return this.cache._calcCardsPerRank;
    }
    var cardsPerSuit = {};

    for (var cardIndex in this.hand) {
      var suit = this.hand[cardIndex].slice(1, 2);
      if (cardsPerSuit[suit]) {
        cardsPerSuit[suit] += 1;
      } else {
        cardsPerSuit[suit] = 1;
      }
    }

    this.cache._calcCardsPerSuit = cardsPerSuit;
    return this.cache._calcCardsPerSuit;
  }

  get _calcRuns() {
    if (this.cache._calcRuns) {
      return this.cache._calcRuns;
    }

    this.cache._calcRuns = cardsPerSuit;
    return this.cache._calcRuns;
  }

  get _calcKinds(count) {
    if (this.cache._calcKinds) {
      return this.cache._calcKinds;
    }
    var kinds = [];

    for (var rankKey in this._calcCardsPerRank) {
      if (this._calcCardsPerRank[rankKey] === count) {
        kinds.push(rankKey);
      }
    }

    this.cache._calcKinds = { 'ranks': kinds, 'count': kinds.length };
    return this.cache._calcKinds;
  }
}
