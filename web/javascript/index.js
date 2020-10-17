function main() {
  var dealHandsUrl = "https://8x16jr2jii.execute-api.us-east-1.amazonaws.com/dev/some-lambda-thing?action=dealHands&number=5";

  httpGetAsync(dealHandsUrl, dealHands);
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
  var handElement;
  var id;

  for (handIndex in hands) {
    hand = hands[handIndex];
    handElement = createElement('div', 'id', 'hand_' + handIndex);

    handElement.innerText = 'Hand ' + handIndex + ': ';
    for (cardsIndex in hand) {
      handElement.innerText += hand[cardsIndex] + ' ';
    }
    table.append(handElement);
  }
}

function createElement(tag, attribute, value) {
  element = document.createElement(tag);
  id = document.createAttribute(attribute);
  id.value = value;
  element.attributes.setNamedItem(id);

  return element;
}

main();
