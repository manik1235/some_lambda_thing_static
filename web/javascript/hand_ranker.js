import { Hand } from './hand.js';

export class HandRanker {
  constructor(hand) {
    this.cache = {};
    this.hand = new Hand(hand);
  }

  get stats() {
    return;
    var handStats = {};

    handStats.hand = this.hand;
    handStats.length = this.hand.length;
    handStats.cardsPerRank = this._calcRanks.cardsPerRank;
    handStats.ranks = this._calcRanks.ranks;
    handStats.pairs = this._calcPairs;
    handStats.trips = this._calcTrips;
    handStats.quads = this._calcKinds(4);
    handStats.cardsPerSuit = this._calcCardsPerSuit;
    handStats.runs = this._calcRuns;
    handStats.cards = this._calcCards;

    handStats.hands = this._calcHands;

    return handStats;
  }

  get _calcHands() {
    /*
     *  What should output look like?
     *  Should I have a Hand class? Is that what this is?
     *  {
     *    hands: [  // Ordered from highest to lowest?
     *      highest: "straghtFlush" // Key name of the highest hand
     *      straightFlush: { // hand = [Th, Jh, Qh, Kh, Ah]
     *        cards: [Th, Jh, Qh, Kh, Ah],
     *      }
     *      pairs: [ // hand = [Th, Tc, 3h, 3c, Xx]
     *        0: { used: [Th, Tc], unused: [3h, 3c, Xx] },
     *        1: { used: [3h, 3c], unused: [Th, Tc, Xx] }
     *      ]
     *      pairs: [ // hand = [Th, Tc, 3h, 3c, 3s]
     *        0: { used: [Th, Tc], unused: [3h, 3c, 3s] },
     *        1: { used: [3h, 3c], unused: [Th, Tc, 3s] },
     *        2: { used: [3c, 3s], unused: [Th, Tc, 3h] },
     *        3: { used: [3s, 3h], unused: [Th, Tc, 3c] }
     *      ]
     *      trips: [ // hand = [Th, Tc, 3h, 3c, 3s]
     *        0: { used: [3h, 3c, 3s], unused: [Th, Tc] }
     *      ]
     *      straights: [ // hand = [3x, 4x, 6x, 5x, 7x]
     *        0: { used: [3x, 4x, 6x, 5x, 7x], unused: [] }
     *      ]
     *    ],
     *
     *    draws: [
     *      insideStraightDraws: [
     *        0: {
     *          cards: [Th, Jh, Kh, Ac],
     *          outs: [Qc, Qd, Qh, Qs] - seenCards,
     *        },
     *      ],
     *      flushDraws: [
     *        0: {
     *          cards: [Th, Jh, Kh, 2h],
     *          outs: [allHearts] - seenCards,
     *        },
     *      ],
     *    ]
     *  }
     *
     *
     *
     *
     *
     */

    var hands = {};

    hands.pairs = this._calcPairs;
    hands.trips = this._calcTrips;

  }

  get _calcRanks() {
    var cardsPerRank = {};
    var ranks = [];

    for (var cardIndex in this.hand) {
      var rank = this.hand[cardIndex].slice(0, 1);
      ranks.push(rank);
      if (cardsPerRank[rank]) {
        cardsPerRank[rank] += 1;
      } else {
        cardsPerRank[rank] = 1;
      }
    }

    return { 'cardsPerRank': cardsPerRank, 'ranks': ranks };
  }

  get _calcCardsPerSuit() {
    var cardsPerSuit = {};

    for (var cardIndex in this.hand) {
      var suit = this.hand[cardIndex].slice(1, 2);
      if (cardsPerSuit[suit]) {
        cardsPerSuit[suit] += 1;
      } else {
        cardsPerSuit[suit] = 1;
      }
    }

    return cardsPerSuit;
  }

  _numericRanks(ranks, sorted = false) {
    var numericRanks = [];
    var numericRank;
    var sortedNumRanks;

    for (var rankIndex in ranks) {
      numericRank = this._calcMagnitude(ranks[rankIndex]);

      for (var numericRankIndex in numericRank) {
        numericRanks.push(numericRank[numericRankIndex]);
      }
    }

    if (sorted) {
      sortedNumRanks = numericRanks.sort(function(a, b) {
        if (a < b) { return -1; }
        if (a > b) { return 1; }
        return 0;
      });
    }

    return numericRanks;
  }

  _calcKinds(count) {
    if (this.cache._calcKinds) {
      if (this.cache._calcKinds[count]) {
        return this.cache._calcKinds[count];
      }
    }
    var kinds = [];

    for (var rankKey in this._calcRanks) {
      if (this._calcRanks[rankKey] == count) {
        kinds.push(rankKey);
      }
    }

    if (!this.cache._calcKinds) {
      this.cache._calcKinds = {};
    }
    this.cache._calcKinds[count] = { 'ranks': kinds, 'count': kinds.length };
    return this.cache._calcKinds[count];
  }
}
