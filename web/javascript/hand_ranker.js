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
    handStats.pairs = this._calcKinds(2);
    handStats.trips = this._calcKinds(3);
    handStats.quads = this._calcKinds(4);
    handStats.cardsPerSuit = this._calcCardsPerSuit;
    handStats.runs = this._calcRuns;

    return handStats;
  }

  get _calcRanks() {
    if (this.cache._calcRanks) {
      return this.cache._calcRanks;
    }
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

    this.cache._calcRanks = { 'cardsPerRank': cardsPerRank, 'ranks': ranks };
    return this.cache._calcRanks;
  }

  get _calcCardsPerSuit() {
    if (this.cache._calcRanks) {
      return this.cache._calcRanks;
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

    this.cache._calcRuns = runs;
    return this.cache._calcRuns;
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
      if (this._calcRanks[rankKey] === count) {
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
