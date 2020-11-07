var dealHandsUrl = "https://8x16jr2jii.execute-api.us-east-1.amazonaws.com/dev/some-lambda-thing?action=dealHands&number=5";

export function getHands()
{
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function() {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
      return JSON.parse(xmlHttp.responseText).hands.hands;
  }
  xmlHttp.open("GET", dealHandsUrl, true);
  xmlHttp.send(null);
}

