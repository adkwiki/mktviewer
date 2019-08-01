function mapperOverview(coinlib_coin) {

  let spirt_price = splitBtcPrice(parseFloat(coinlib_coin["price"]));

  console.log(spirt_price);

  $("#ov_price_left").text(spirt_price.left);
  $("#ov_price_right").text(spirt_price.right);

  let change = coinlib_coin["change"].toFixed(1);
  $("#ov_price_change").text(change + "%");
  if (change > 0) {
    $("#ov_price_change").attr("class","price-buy");
  } else if (change < 0) {
    $("#ov_price_change").attr("class","price-sell");
  }

  $("#ov_volume_24h").text(coinlib_coin["volume"].toFixed(2));

  $("#ov_market_cap").text(coinlib_coin["marketCap"].toFixed(2));
  $("#ov_rank").text(coinlib_coin["rank"]);
}

function callCoinlibApi() {
  fetch('https://api.coinranking.com/v1/public/coins?symbols=adk&base=btc',
    { mode:"cors" })
    .then(response => {
      if(response.ok) {
        return response.json();
      } else {
        throw new Error();
      }
    })
    .then(json => {
      mapperOverview(json.data.coins[0]);
    })
    .catch(error => console.log(error));
}
