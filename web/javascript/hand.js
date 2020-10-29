import { Card } from './card.js';

export class Hand {
  constructor(hand) {
    this.hand = hand;
  }

  get length() {
    return this.hand.length;
  }

  /*
   *
   *  magnitudes: { // hand = [Ah, Ad, 2d, 2h, Js]
   *    1: [Ah, Ad],
   *    2: [2d, 2h],
   *    11: [Js],
   *    14: [Ah, Ad],
   *  }
   *
   */
  get cardsByMagnitude() {
    var magnitudes = {};
    var cards = this.cards;
    var magnitudeIndex;

    for (var cardIndex in cards) {
      var card = cards[cardIndex];
      // var key = JSON.stringify(card.magnitude);
      if (magnitudes[card.magnitude]) {
        for (magnitudeIndex in card.magnitude) {
          magnitudes[card.magnitude[magnitudeIndex]].push(card);
        }
      } else {
        magnitudes[card.magnitude[0]] = [card];
        for (magnitudeIndex = 1; magnitudeIndex < card.magnitude.length; magnitudeIndex++) {
          if (magnitudes[card.magnitude[magnitudeIndex]]) {
            magnitudes[card.magnitude[magnitudeIndex]].push(card);
          } else {
            magnitudes[card.magnitude[magnitudeIndex]] = [card];
          }
        }
      }
    }

    return magnitudes;
  }

  /*
   *  [
   *    0: { name: '2c', rank: 2, suit: c, magnitude: [2] },
   *    1: { name: '4d', rank: 4, suit: d, magnitude: [4] },
   *    2: { name: 'Ad', rank: A, suit: d, magnitude: [1, 14] },
   *    3: { name: 'Kd', rank: K, suit: d, magnitude: [13] },
   *  ]
   */
  get cards() {
    var cards = [];
    var hand = this.hand;

    for (var card of hand) {
      cards.push(new Card(card));
    }

    return cards;
  }

  /*
   *
   *  highCards: [ // hand = [Th, Tc, 3h, 3c, 3s]
   *    0: { rank: T, used: [Th], unused: [3h, 3c, 3s, Tc], magnitude: 10 },
   *    1: { rank: T, used: [Tc], unused: [3h, 3c, 3s, Th], magnitude: 10 },
   *  ]
   *
   *  highCards: [ // hand = [Ah, Ac, 3h, 3c, 3s]
   *    0: { rank: A, used: [Ah], unused: [3h, 3c, 3s, Ac], magnitude: 14 },
   *    1: { rank: A, used: [Ac], unused: [3h, 3c, 3s, Ah], magnitude: 14 },
   *  ]
   *
   */
  get highCard() {
    var cards = this.cards;
    var card, unused, highCard;

    for (var cardIndex in cards) {
      card = cards[cardIndex];
      if (!highCard || card.magnitude > highCard.magnitude) {
        unused = cards.filter(c => c.name !== card.name);
        highCard = { rank: card.rank, used: [card], unused: unused, magnitude: card.magnitude };
      }
    }

    return highCard;
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
  get pairs() {
    var pairs = [];
    var cards = this.cards;
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
  get trips() {
    var trips = {};
    var pairs = this.pairs;
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

  /*
   *  straight: { // hand = [3x, 4x, 6x, 5x, 7x]
   *    used: [3x, 4x, 5x, 6x, 7x],
   *    magnitude: 3
   *  },
   *
   */
  get straight() {
    return this._calcRun[this.length];
  }

  /*
   *  runs: { // hand = [3x, 4x, 6x, 5x, 7x]
   *    5: [
   *         { used: [3x, 4x, 5x, 6x, 7x], unused: [], magnitude: 3 },
   *       ],
   *    4: [
   *         { used: [3x, 4x, 5x, 6x], unused: [7x], magnitude: 3 },
   *         { used: [4x, 5x, 6x, 7x], unused: [3x], magnitude: 4 },
   *       ],
   *    3: [
   *         { used: [3x, 4x, 5x], unused: [6x, 7x], magnitude: 3 },
   *         { used: [4x, 5x, 6x], unused: [3x, 7x], magnitude: 4 },
   *         { used: [5x, 6x, 7x], unused: [3x, 4x], magnitude: 5 },
   *       ],
   *    2: [
   *         { used: [3x, 4x], unused: [5x, 6x, 7x], magnitude: 3 },
   *         { used: [4x, 5x], unused: [3x, 6s, 7x], magnitude: 4 },
   *         { used: [5x, 6x], unused: [3x, 4x, 7x], magnitude: 5 },
   *         { used: [6x, 7x], unused: [3x, 4x, 5x], magnitude: 6 },
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
   *          // hand = [Ax, 2x, 3h, 3c, Kx]
   *  runs: { // hand = [1x, 2x, 3h, 3c, 13x, 14x]
   *    3: [
   *         { used: [Ax, 2x, 3h], unused: [3c, Kx] },
   *         { used: [Ax, 2x, 3c], unused: [3h, Kx] },
   *       ],
   *    2: [
   *         { used: [Ax, 2x], unused: [3h, 3c, Kx] },
   *         { used: [2x, 3h], unused: [Ax, 3h, Kx] },
   *         { used: [2x, 3c], unused: [Ax, 3h, Kx] },
   *         { used: [Kx, Ax], unused: [2x, 3h, 3c] },
   *       ],
   *  }
   *
   *
   *
   */
  get _calcRun() {
    var runs = {};
    var cardsByMagnitude = this.cardsByMagnitude;
    var magnitudes = Object.keys(cardsByMagnitude).map(c => parseInt(c)).sort((a, b) => a - b);

    // deltas
    var deltas = [];

    for (var i = 1; i < magnitudes.length; i++) {
      deltas.push(magnitudes[i] - magnitudes[i - 1]);
    }

    for (var deltaIndex = 0; deltaIndex < deltas.length; deltaIndex++) {
      var unused = [];
      var runLength = 1;
      var run = [magnitudes[deltaIndex]];
      if (deltas[deltaIndex] === 1) {
        for (var startDeltaIndex = deltaIndex; startDeltaIndex < deltas.length; startDeltaIndex++) {
          if (deltas[startDeltaIndex] === 1) {
            runLength++;
            run.push(magnitudes[startDeltaIndex + 1]);

            // filter out the cards that aren't used
            //unused = magnitudes.filter(m => m

            if (runs[runLength]) {
              // hand._calcRun[3][0].used[hand._calcRun[3][0].used.length - 1][0].magnitude
              runs[runLength].push({ used: this.dup(run), unused: this.dup(unused), magnitude: magnitudes[startDeltaIndex + 1] });
            } else {
              runs[runLength] = [{ used: this.dup(run), unused: this.dup(unused), magnitude: magnitudes[startDeltaIndex + 1] }];
            }
          } else {
            break;
          }
        }
      } else {
        // runLength = 1;
        // run = [magnitudes[startDeltaIndex + 1]];
      }
    }

    // Replace the magnitudes with the cards
    for (runLength in runs) {
      var run = runs[runLength];
      for (var runIndex in run) {
        var used = run[runIndex].used;
        var usedCards = used.map(magnitude => cardsByMagnitude[magnitude]);
        runs[runLength][runIndex].used = usedCards;
      }
    }

    return runs;
  }
  /*
   *    4: [
   *         { used: [3x, 4x, 5x, 6x], unused: [7x], magnitude: 3 },
   *         { used: [4x, 5x, 6x, 7x], unused: [3x], magnitude: 4 },
   *       ],
   */

  dup(object) {
    return JSON.parse(JSON.stringify(object));
  }



  /*
   *
   *  hand = [3x, 4x, 5x, 6x, 7x]
   *  deltas =  [
   *    1: [
   *      3x,
   *      4x,
   *    ],[
   *      4x,
   *      5x,
   *    ],[
   *      ...
   *    ]
   *  ];
   *
   *  hand = [3x, 4x, 6x, 7x, 8x]
   *  deltas = {
   *    1: [
   *      { 4x: 3x },    // ones = deltas.1;
   *      { 7x: 6x },    //
   *      { 8x: 7x },
   *    ],
   *    2: [
   *      { 4x: 6x },
   *    ],
   *  };
   *
   *
   *
   */
  /*
  get _deltas() {
    var deltas = [
      { used: },
    ];

    for (var i = 1; i < magnitudes.length; i++) {
      deltas.push(magnitudes[i] - magnitudes[i - 1]);
    }
  }
  */
}
