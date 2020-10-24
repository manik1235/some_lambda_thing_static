import { HandRanker } from './hand_ranker.js';

function main() {
  var dealHandsUrl = "https://8x16jr2jii.execute-api.us-east-1.amazonaws.com/dev/some-lambda-thing?action=dealHands&number=5";

  // httpGetAsync(dealHandsUrl, dealHands);
  dealHands(mockResponse());
}

function mockResponse() {
  var response = { "hands": {
    "hands": {
      "0": [
        "8♦",
        "9♣",
        "2♣",
        "5♣",
        "3♣"
      ],
      "1": [
        "3♣",
        "3♥",
        "K♥",
        "3♤",
        "J♣"
      ],
      "2": [
        "2♦",
        "5♦",
        "4♥",
        "K♦",
        "4♣"
      ],
      "3": [
        "T♦",
        "T♤",
        "J♦",
        "9♤",
        "5♥"
      ],
      "4": [
        "T♥",
        "K♣",
        "3♦",
        "K♤",
        "7♥"
      ]
    }
  }}

  return JSON.stringify(response);
}

function httpGetAsync(theUrl, callback)
{
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function() {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
      callback(xmlHttp.responseText);
  }
  xmlHttp.open("GET", theUrl, true);
  xmlHttp.send(null);
}

function dealHands(response) {
  var hands = JSON.parse(response).hands.hands;
  var table = document.getElementById('table');
  var hand;
  var handElement;
  var id;

  for (var handIndex in hands) {
    hand = hands[handIndex];
    handElement = createElement('div', 'id', 'hand_' + handIndex);

    handElement.innerText = 'Hand ' + handIndex + ': ';
    for (var cardsIndex in hand) {
      handElement.innerText += hand[cardsIndex] + ' ';
    }
    var handRanker = new HandRanker(hand);
    console.log('Hand Stats');
    console.log(handRanker.stats);
    table.append(handElement);
  }
}

function createElement(tag, attribute, value) {
  var element = document.createElement(tag);
  var id = document.createAttribute(attribute);
  id.value = value;
  element.attributes.setNamedItem(id);

  return element;
}

main();
