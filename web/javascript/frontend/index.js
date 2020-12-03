import { HandRanker } from '../backend/hand_ranker.js';
import { mockGetHands} from '../utilities/mocks.js';
import { getHands } from './hands.js';

class ViewHands {
  deal() {
    // this._dealHands(getHands()); // Get hands from Lambda
    this._dealHands(mockGetHands()); // Get hands from the hand mocks utility
  }

  _dealHands(hands) {
    var table = document.getElementById('table');
    var hand;
    var handElement;
    var id;

    for (var handIndex in hands) {
      hand = hands[handIndex];
      handElement = this._createElement('div', 'id', 'hand_' + handIndex);

      handElement.innerText = 'Hand ' + handIndex + ': ';
      for (var cardsIndex in hand) {
        handElement.innerText += hand[cardsIndex] + ' ';
      }
      var handRanker = new HandRanker(hand);
      console.log('Hand Stats');
      console.log(handRanker.stats);
      if (window.handRankers) {
        window.handRankers.push(handRanker);
      } else {
        window.handRankers = [handRanker];
      }
      table.append(handElement);

      // Draw first card image
      var cardCanvasElement = this._createElement('div', 'id', 'hand_' + handIndex + 'card_0');
      var card = handRanker.cards[0];
      card.draw(cardCanvasElement);
      table.append(cardCanvasElement);
    }
  }

  _createElement(tag, attribute, value) {
    var element = document.createElement(tag);
    var id = document.createAttribute(attribute);
    id.value = value;
    element.attributes.setNamedItem(id);

    return element;
  }

  displayHandRanks(container) {
  }
}

var view = new ViewHands();
view.deal();
