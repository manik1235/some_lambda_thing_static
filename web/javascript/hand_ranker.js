export class HandRanker {
  constructor(hand) {
    this.cache = {};
    this.hand = hand;
  }

  get stats() {
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

  /*
   *  [
   *    0: { name: '2c', rank: 2, suit: c, magnitude: [2] },
   *    1: { name: '4d', rank: 4, suit: d, magnitude: [4] },
   *    2: { name: 'Ad', rank: A, suit: d, magnitude: [1, 14] },
   *    3: { name: 'Kd', rank: K, suit: d, magnitude: [13] },
   *  ]
   */
  get _calcCards() {
    var cards = [];
    var hand = this.hand;
    var rank, suit, magnitude;

    for (var cardIndex in hand) {
      rank = hand[cardIndex].slice(0, 1);
      suit = hand[cardIndex].slice(1, 2);
      magnitude = this._calcMagnitude(rank);
      cards.push({ name: hand[cardIndex], rank: rank, suit: suit, magnitude: magnitude });
    }

    return cards;
  }

  /*
   *  pairs: [ // hand = [Th, Tc, 3h, 3c, 3s]
   *    0: { rank: T, used: [Th, Tc], unused: [3h, 3c, 3s] },
   *    1: { rank: 3, used: [3h, 3c], unused: [Th, Tc, 3s] },
   *    2: { rank: 3, used: [3c, 3s], unused: [Th, Tc, 3h] },
   *    3: { rank: 3, used: [3s, 3h], unused: [Th, Tc, 3c] }
   *  ]
   *
   *  pairs: [ // hand = [Th, Tc, 3h, 3c, 3s]
   *    0: { rank: 'T', used: [Th, Tc], unused: [3h, 3c, 3s] },
   */
  get _calcPairs() {
    var pairs = [];
    var cards = this._calcCards;
    var card, rank, pair, unused;

    for (var cardIndex in cards) {
      card = cards[cardIndex];
      rank = card.rank;

      for (var i = parseInt(cardIndex) + 1; i < cards.length; i++) {
        if (rank === cards[i].rank) {
          unused = cards.filter(c => c.name !== card.name && c.name !== cards[i].name);
          pair = { rank: rank, used: [card, cards[i]], unused: unused };
          pairs.push(pair);
        }
      }
    }

    return pairs;
  }

  /*
   *  trips: { // hand = [Th, Tc, 3h, 3c, 3s]
   *    [3h, 3c, 3s].sorted: { rank: 3, used: [3h, 3c, 3s], unused: [Th, Tc] },
   *  }
   */
  get _calcTrips() {
    var trips = {};
    var pairs = this._calcPairs;
    var unusedCards;
    var unusedCard;
    var pair;
    var unused;
    var dedupKey;
    var trip;

    for (var pairIndex in pairs) {
      pair = pairs[pairIndex];
      unusedCards = pair.unused;

      for (var unusedCardIndex in unusedCards) {
        unusedCard = unusedCards[unusedCardIndex];

        if (unusedCard.rank === pair.rank) {
          unused = pair.unused.filter(c => c.name !== unusedCard.name);
          trip = JSON.parse(JSON.stringify(pair));
          trip.used.push(unusedCard);

          dedupKey = []
          for (var usedIndex in trip.used) {
            dedupKey.push(trip.used[usedIndex].name);
          }
          dedupKey.sort();

          trips[dedupKey] = {
            rank: unusedCard.rank,
            used: trip.used,
            unused: unused
          };
        }
      }
    }

    return Object.values(trips);
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

  /*
   * Should a straight be defined by the number of cards in your hand?
   * I don't think so, I think it should really just return the runs,
   * and then you can pick the runs that equal the length of hands if you
   * want. So for `handstats.hands`, that would just be the ones that are
   * the length of the hand, but `handstats.runs` would be everything.
   *
   *  runs: { // hand = [3x, 4x, 6x, 5x, 7x]
   *    5: [
   *         { used: [3x, 4x, 5x, 6x, 7x], unused: [] },
   *       ],
   *    4: [
   *         { used: [3x, 4x, 5x, 6x], unused: [7x] },
   *         { used: [4x, 5x, 6x, 7x], unused: [3x] },
   *       ],
   *    3: [
   *         { used: [3x, 4x, 5x], unused: [6x, 7x] },
   *         { used: [4x, 5x, 6x], unused: [3x, 7x] },
   *         { used: [5x, 6x, 7x], unused: [3x, 4x] },
   *       ],
   *    2: [
   *         { used: [3x, 4x], unused: [5x, 6x, 7x] },
   *         { used: [4x, 5x], unused: [3x, 6s, 7x] },
   *         { used: [5x, 6x], unused: [3x, 4x, 7x] },
   *         { used: [6x, 7x], unused: [3x, 4x, 5x] },
   *       ],
   *  }
   *
   *          // hand = [Ax, 2x, 3x, Qx, Kx]
   *  runs: { // hand = [1x, 2x, 3x, 12x, 13x, 14x]
   *    3: [
   *         { used: [Ax, 2x, 3x], unused: [Qx, Kx] },
   *         { used: [Qx, Kx, Ax], unused: [2x, 3x] },
   *       ],
   *    2: [
   *         { used: [Ax, 2x], unused: [3x, Qx, Kx] },
   *         { used: [2x, 3x], unused: [Ax, Qs, Kx] },
   *         { used: [Qx, Kx], unused: [Ax, 2x, 3x] },
   *         { used: [Kx, Ax], unused: [2x, 3x, Qx] },
   *       ],
   *  }
   *
   *
   *
   *
   */
  get _calcRuns() {
    var runs = {};
    var rankOrdered = Array.from(new Set(this._numericRanks(this._calcRanks.ranks, true)));
    var deltas = [];

    for (var i = 1; i < rankOrdered.length; i++) {
      deltas.push(rankOrdered[i] - rankOrdered[i - 1]);
    }

    var runLength = 1;
    for (var deltaIndex in deltas) {
      if (deltas[deltaIndex] === 1) {
        runLength++;
        if (deltaIndex == deltas.length - 1) {
          if (runs[runLength]) {
            runs[runLength]++
          } else {
            runs[runLength] = 1;
          }
        }
      } else {
        if (runs[runLength]) {
          runs[runLength]++
        } else {
          runs[runLength] = 1;
        }
        runLength = 1;
      }
    }

    return runs;
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

  _calcMagnitude(rank) {
    // This should probably come from lambda
    var transform = {
      'A': [1, 14]
      ,'K': [13]
      ,'Q': [12]
      ,'J': [11]
      ,'T': [10]
    }

    var magnitude = transform[rank];

    if (magnitude) {
      return magnitude;
    } else {
      return [parseInt(rank)];
    }
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
