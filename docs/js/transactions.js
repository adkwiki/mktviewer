function splitBtcPrice(btcPrice) {
  var btcPriceString = btcPrice.toFixed(8);
  var result = btcPriceString.match(/^[0|¥.]+/ );
  var left = result[0];
  var right = btcPriceString.replace(left,"");

  console.log(left + ":" + right);

  return {left: left, right: right};
}

// make table
function makeTable(dataArray, tableId) {

  // header
  $("#"+tableId).append(
      $("<tr></tr>")
          .append($("<td></td>").text("timestamp"))
          .append($("<td></td>").text("price"))
          .append($("<td></td>").text("ADK"))
          //.append($("<td></td>").text("BTC"))
  );

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

    // calc btc amount
    //var amountBtc = price * data["amount"];

    $("#"+tableId).append(
        $("<tr></tr>")
            .append($("<td></td>").text(ouputTimestamp))
            .append(priceTd)
            .append($('<td class="price"></td>').text(data["amount"].toFixed(2)))
            //.append($('<td class="price"></td>').text(amountBtc.toFixed(8)))
    );
  }
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
      $("#updatedAt").text("Updated at " + moment().format());
      makeTable(json.transactions.data,"table-transaction");
      $("#message").text("");
    })
    .catch(error => console.log(error));
}
