// make table
function mapperTransactions(dataArray, rawTxTableId) {

  var txsBtcTotalBuy = 0
  var txsBtcTotalSell = 0
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
    );

    // calc btc amount
    var amountBtc = price * amoutAdk;
    var dec4AmountBtc = Number(amountBtc.toFixed(8))

    // sum buy/sell adk, create btc amount array
    if (buySellType === "buy") {
      txsBtcTotalBuy += amountBtc;
      btcAmountArray.unshift(dec4AmountBtc);
    } else {
      txsBtcTotalSell += amountBtc;
      btcAmountArray.unshift(-1 * dec4AmountBtc);
    }
  }

  // floor
  txsBtcTotalBuy = txsBtcTotalBuy.toFixed(2);
  txsBtcTotalSell = txsBtcTotalSell.toFixed(2);

  $("#vol_buy_txs").text(txsBtcTotalBuy);
  $("#vol_sell_txs").text(txsBtcTotalSell);

  // txs sparkline
  $("#txs_graph").sparkline(btcAmountArray, {
    type: 'bar',
    height: '50',
    barWidth: 2,
    barColor: '#0FB387',
    negBarColor: '#D9544F'});

  // buy/sell pie
  $("#vol_graph_txs").sparkline([txsBtcTotalBuy, txsBtcTotalSell], {
    type: 'pie',
    width: '20',
    height: '20',
    sliceColors: ['#0FB387','#D9544F'],
    offset: -90});
}

function callAidosMaketTransactionsApi() {
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
      mapperTransactions(json.transactions.data, "txs_list");
    })
    .catch(error => console.log(error));
}
