function splitBtcPrice(btcPrice) {
  var btcPriceString = btcPrice.toFixed(8);
  var result = btcPriceString.match(/^[0|¥.]+/ );
  var left = result[0];
  var right = btcPriceString.replace(left,"");

  return {left: left, right: right};
}

// make table
function makeTable(dataArray, rawTxTableId, gaugeTableId) {

  // header
  $("#"+rawTxTableId).append(
      $("<tr></tr>")
          .append($("<td></td>").text("timestamp"))
          .append($("<td></td>").text("price"))
          .append($("<td></td>").text("ADK"))
          //.append($("<td></td>").text("BTC"))
  );

  var txsAdkTotalBuy = 0
  var txsAdkTotalSell = 0
  var btcAmountArray = [];

  // data
  for (let data of dataArray) {

    // date formatter
    var now = moment();
    var timestamp = moment(data["timestamp"] * 1000);

    // today? yes -> hh:mm:ss, no -> MM/DD hh:mm
    var ouputTimestamp = "";
    const FORMAT_YYYYMMDD = "YYYY-MM-DD"
    if (now.format(FORMAT_YYYYMMDD) === timestamp.format(FORMAT_YYYYMMDD)) {
      // today? yes -> HH:mm:ss, no -> MM/DD HH:mm
      ouputTimestamp = timestamp.format("HH:mm:ss");
    } else {
      ouputTimestamp = timestamp.format("MM/DD HH:mm");
    }

    // price
    var price = data["price"];
    var spritPrice = splitBtcPrice(price);
    var convertPrice = spritPrice.left + ":" + spritPrice.right;

    // type
    var buySellType = data["type"].toLowerCase();

    var priceTd = $('<td class="price"></td>')
      .append($('<span class="price-left"></span>').text(spritPrice.left))
      .append($('<span class="price-' + buySellType + '"></span>').text(spritPrice.right))
    ;


    // adk amount
    var amoutAdk = data["amount"];

    $("#"+rawTxTableId).append(
        $("<tr></tr>")
            .append($("<td></td>").text(ouputTimestamp))
            .append(priceTd)
            .append($('<td class="price"></td>').text(amoutAdk.toFixed(2)))
            //.append($('<td class="price"></td>').text(amountBtc.toFixed(8)))
    );

    // calc btc amount
    var amountBtc = price * amoutAdk;
    var dec4AmountBtc = Number(amountBtc.toFixed(8))

    // sum buy/sell adk, create btc amount array
    if (buySellType === "buy") {
      txsAdkTotalBuy += amoutAdk;
      btcAmountArray.push(dec4AmountBtc);
    } else {
      txsAdkTotalSell += amoutAdk;
      btcAmountArray.push(-1 * dec4AmountBtc);
    }
  }

  // gauge
  $("#"+gaugeTableId).append(
      $("<tr></tr>")
        .append($('<td></td>')
          .append($('<span class="price-sell"></span>').text("SELL"))
        )
        .append($('<td></td>')
          .append($('<span class="price-buy"></span>').text("BUY"))
        )
        .append($('<td rowspan="2"></td>')
          .append($('<span id="graph-txs-sum"></span>'))
        )
);

  $("#"+gaugeTableId).append(
      $("<tr></tr>")
        .append($('<td></td>')
          .append($('<span class="price-sell"></span>').text(txsAdkTotalSell.toFixed(1)))
        )
        .append($('<td></td>')
          .append($('<span class="price-buy"></span>').text(txsAdkTotalBuy.toFixed(1)))
        )
  );

  // txs sparkline
  $("#sparkline").sparkline(btcAmountArray, {
    type: 'bar',
    height: '50',
    barWidth: 2,
    barColor: '#00ff7f',
    negBarColor: '#dc143c'});

  // buy/sell sparkline pie
  $("#graph-txs-sum").sparkline([txsAdkTotalBuy, txsAdkTotalSell], {
    type: 'pie',
    width: '30',
    height: '30',
    sliceColors: ['#00ff7f','#dc143c'],
    offset: -90});

}

function callMaketApi() {
  fetch('https://aidosmarket.com/api/transactions?limit=50',
    { mode:"cors" })
    .then(response => {
      if(response.ok) {
        return response.json();
      } else {
        throw new Error();
      }
    })
    .then(json => {
      // mapping to table
      $("#updatedAt").text("Updated at " + moment().format("YYYY/DD/DD HH:mm:ss"));
      makeTable(json.transactions.data, "table-transaction", "table-tx-sell-buy-per");
      $("#message").text("");
    })
    .catch(error => console.log(error));
}
