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
    handStats.pairs = this._calcPairs; // this._calcKinds(2);
    handStats.trips = this._calcTrips; //this._calcKinds(3);
    handStats.quads = this._calcKinds(4);
    handStats.cardsPerSuit = this._calcCardsPerSuit;
    handStats.runs = this._calcRuns;

    handStats.hands = this._calcHands;

    return handStats;
  }

  /*
   *  [
   *    0: { name: '2c', rank: 2, suit: c },
   *    1: { name: '4d', rank: 4, suit: d },
   *  ]
   */
  get _calcCards() {
    var cards = [];
    var hand = this.hand;
    var rank, suit;

    for (var cardIndex in hand) {
      rank = hand[cardIndex].slice(0, 1);
      suit = hand[cardIndex].slice(1, 2);
      cards.push({ name: hand[cardIndex], rank: rank, suit: suit });
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

  get _calcRuns() {
    var runs = {};
    var rankOrdered = Array.from(new Set(this._numericRanks(this._calcRanks.ranks)));
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

  _numericRanks(ranks) {
    var transform = {
      'A': [1, 14]
      ,'K': [13]
      ,'Q': [12]
      ,'J': [11]
      ,'T': [10]
    }
    var numRanks = [];

    for (var rankIndex in ranks) {
      var numRank = transform[ranks[rankIndex]]
      if (numRank) {
        for (var numRankIndex in numRank) {
          numRanks.push(numRank[numRankIndex]);
        }
      } else {
        numRanks.push(parseInt(ranks[rankIndex]));
      }
    }

    var sortedNumRanks = numRanks.sort(function(a, b) {
      if (a < b) {
        return -1;
      }
      if (a > b) {
        return 1;
      }
      return 0;
    });
    return numRanks;
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
