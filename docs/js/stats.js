function mapperStats(stats) {

  let last_price = splitBtcPrice(stats["last_price"]);
  $("#last_price_left").text(last_price.left);
  $("#last_price_right").text(last_price.right);

  let vol_buy_24h = stats["24h_volume_buy"];
  $("#vol_buy_24h").text(vol_buy_24h.toFixed(2));

  let vol_sell_24h = stats["24h_volume_sell"];
  $("#vol_sell_24h").text(vol_sell_24h.toFixed(2));

  let vol_buy_1h = stats["1h_volume_buy"];
  $("#vol_buy_1h").text(vol_buy_1h.toFixed(2));

  let vol_sell_1h = stats["1h_volume_sell"];
  $("#vol_sell_1h").text(vol_sell_1h.toFixed(2));

  // render vol graphs

  // buy/sell sparkline pie 24h
  $("#vol_graph_24h").sparkline([vol_buy_24h, vol_sell_24h], {
    type: 'pie',
    width: '20',
    height: '20',
    sliceColors: ['#0FB387','#D9544F'],
    offset: -90});

  // buy/sell sparkline pie 1h
  $("#vol_graph_1h").sparkline([vol_buy_1h, vol_sell_1h], {
    type: 'pie',
    width: '20',
    height: '20',
    sliceColors: ['#0FB387','#D9544F'],
    offset: -90});
}

function callAidosMarketStatsApi() {
  fetch('https://aidosmarket.com/api/stats',
    { mode:"cors" })
    .then(response => {
      if(response.ok) {
        return response.json();
      } else {
        throw new Error();
      }
    })
    .then(json => {
      mapperStats(json.stats);
    })
    .catch(error => console.log(error));
}
