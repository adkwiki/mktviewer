function splitBtcPrice(btcPrice) {
  var btcPriceString = btcPrice.toFixed(8);
  var result = btcPriceString.match(/^[0|¥.]+/ );
  var left = result[0];
  var right = btcPriceString.replace(left,"");

  return {left: left, right: right};
}

var am_before_24h_price = undefined;
function setAmBefore24hPrice(price) {
  am_before_24h_price = price;
}

var am_before_24h_moment = undefined;
function setAmBefore24hMoment(moment) {
  am_before_24h_moment = moment;
}
function getAmBefore24hMoment() {
  return am_before_24h_moment;
}

var am_last_price = undefined;
function setAmLastPrice(price) {
  am_last_price = price;
}

function mapperAmChangePer() {

  if (am_before_24h_price === undefined || am_last_price === undefined) {
    return;
  }

  // am_price_change
  var change = 0;
  if (am_before_24h_price < am_last_price) {
    // rise
    change = (am_last_price - am_before_24h_price) / am_before_24h_price * 100;
    change = `+${change.toFixed(1)}%`;
    $("#am_price_change").attr("class","price-buy");

  } else if (am_before_24h_price > am_last_price) {
    // drop
    change = (am_last_price - am_before_24h_price) / am_before_24h_price * 100;
    change = `${change.toFixed(1)}%`;
    $("#am_price_change").attr("class","price-sell");
  }

  $("#am_price_change").text(change);

}
