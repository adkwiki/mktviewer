function splitBtcPrice(btcPrice) {
  var btcPriceString = btcPrice.toFixed(8);
  var result = btcPriceString.match(/^[0|¥.]+/ );
  var left = result[0];
  var right = btcPriceString.replace(left,"");

  return {left: left, right: right};
}
