const LIMIT_RANGE = 20;

function mapperOrderbook(orderbook) {
  // TODO refactor bid/ask code duplication

  var depthArray = [];

  let bidArray = orderbook["bid"];
  let askArray = orderbook["ask"];

  // ignore bloken order
  let isBlokenBidSide = false;
  while (bidArray[0].order_amount < 0) {
    bidArray.shift();
    isBlokenBidSide = true;
  }

  let isBlokenAskSide = false;
  while (askArray[0].order_amount < 0) {
    askArray.shift();
    isBlokenAskSide = true;
  }

  while (askArray[0].price < bidArray[0].price) {
    if (isBlokenBidSide) {
      bidArray.shift();
    }
    if (isBlokenAskSide) {
      askArray.shift();
    }
  }

  // bid
  var bidTotalBtc = 0;
  var bidTotalAdk = 0;

  let headBidPrice = bidArray[0].price;
  let bidLimitPrice = headBidPrice / LIMIT_RANGE;

  for (let bid of bidArray) {
    if (bid.price < bidLimitPrice) {
        break;
    }
    bidTotalBtc = bidTotalBtc + bid.order_value;
    bidTotalAdk = bidTotalAdk + bid.order_amount;

    let spritPrice = splitBtcPrice(bid.price);
    var priceDiv = $('<div class="col-5 px-1 text-right"></div>')
      .append($('<span class="price-left"></span>').text(spritPrice.left))
      .append($('<span class="price-buy"></span>').text(spritPrice.right))
    ;

    $("#ob_bid_list").append(
        $('<div class="row order"></div>')
          .append($('<div class="col-3 px-1 text-right"></div>').text(bidTotalBtc.toFixed(1)))
          .append($('<div class="col-4 px-1 text-right"></div>').text(bid.order_amount.toFixed(2)))
          .append(priceDiv)
    );

    // depth
    var depth = {};
    depth["value"] = bid.price;
    depth["bidsvolume"] = bid.order_value;
    depth["bidstotalvolume"] = bidTotalBtc;
    depthArray.unshift(depth);
  }

  let bidCount = depthArray.length;

  $("#ob_bid_btc").text(bidTotalBtc.toFixed(0));
  $("#ob_bid_adk").text(bidTotalAdk.toFixed(0));


  // ask
  var askTotalBtc = 0;
  var askTotalAdk = 0;

  let headAskPrice = askArray[0].price;
  let askLimitPrice = headAskPrice * LIMIT_RANGE;

  for (let ask of askArray) {
    if (ask.price > askLimitPrice) {
      break;
    }

    askTotalBtc = askTotalBtc + ask.order_value;
    askTotalAdk = askTotalAdk + ask.order_amount;

    let spritPrice = splitBtcPrice(ask.price);
    var priceDiv = $('<div class="col-5 px-1 text-right"></div>')
      .append($('<span class="price-left"></span>').text(spritPrice.left))
      .append($('<span class="price-sell"></span>').text(spritPrice.right))
    ;

    $("#ob_ask_list").append(
        $('<div class="row order"></div>')
          .append(priceDiv)
          .append($('<div class="col-4 px-1 text-right"></div>').text(ask.order_amount.toFixed(2)))
          .append($('<div class="col-3 px-2 text-right"></div>').text(askTotalBtc.toFixed(1)))
    );

    // depth
    var depth = {};
    depth["value"] = ask.price;
    depth["asksvolume"] = ask.order_value;
    depth["askstotalvolume"] = askTotalBtc;
    depthArray.push(depth);
  }

  let askCount = depthArray.length - bidCount;

  $("#ob_ask_btc").text(askTotalBtc.toFixed(0));
  $("#ob_ask_adk").text(askTotalAdk.toFixed(0));

  // render buy/sell graphs
  renderOrderbookGraph(depthArray, bidCount, askCount);
}

// order book chart

function renderOrderbookGraph(depthArray, bidCount, askCount) {

  // Themes begin
  am4core.useTheme(am4themes_animated);
  // Themes end

  // Create chart instance
  var chart = am4core.create("chartdiv", am4charts.XYChart);
  chart.data = depthArray;

  // Set up precision for numbers
  chart.numberFormatter.numberFormat = "#,###.####";

  // Create axes
  var xAxis = chart.xAxes.push(new am4charts.CategoryAxis());
  xAxis.dataFields.category = "value";
  //xAxis.renderer.grid.template.location = 0;
  xAxis.renderer.minGridDistance = 50;

  xAxis.numberFormatter = new am4core.NumberFormatter();
  xAxis.numberFormatter.numberFormat = "[font-size: 0.5rem]#.000000";

  var yAxis = chart.yAxes.push(new am4charts.ValueAxis());
  yAxis.renderer.minGridDistance = 20;

  // Create series
  var series = chart.series.push(new am4charts.StepLineSeries());
  series.dataFields.categoryX = "value";
  series.dataFields.valueY = "bidstotalvolume";
  series.strokeWidth = 2;
  series.stroke = am4core.color("#0FB387");
  series.fill = series.stroke;
  series.fillOpacity = 0.1;
  series.tooltipText = "Ask: [bold]{categoryX}[/]\nTotal volume: [bold]{valueY}[/]\nVolume: [bold]{bidsvolume}[/]"

  var series2 = chart.series.push(new am4charts.StepLineSeries());
  series2.dataFields.categoryX = "value";
  series2.dataFields.valueY = "askstotalvolume";
  series2.strokeWidth = 2;
  series2.stroke = am4core.color("#D9544F");
  series2.fill = series2.stroke;
  series2.fillOpacity = 0.1;
  series2.tooltipText = "Ask: [bold]{categoryX}[/]\nTotal volume: [bold]{valueY}[/]\nVolume: [bold]{asksvolume}[/]"

  var series3 = chart.series.push(new am4charts.ColumnSeries());
  series3.dataFields.categoryX = "value";
  series3.dataFields.valueY = "bidsvolume";
  series3.strokeWidth = 0;
  series3.fill = am4core.color("#000");
  series3.fillOpacity = 0.2;

  var series4 = chart.series.push(new am4charts.ColumnSeries());
  series4.dataFields.categoryX = "value";
  series4.dataFields.valueY = "asksvolume";
  series4.strokeWidth = 0;
  series4.fill = am4core.color("#000");
  series4.fillOpacity = 0.2;

  // Add cursor
  chart.cursor = new am4charts.XYCursor();

  // init zoom area
  chart.events.on("datavalidated", function () {

    let center = bidCount / (bidCount + askCount);

    let startPos = center - (center * 0.1);
    let endPos = center + (center * 0.1);

    xAxis.zoom({start:startPos, end:endPos});
  });

  $('input[name="segmented"]:radio').change( function() {
     var radioval = $(this).val();

     let center = bidCount / (bidCount + askCount);

     let startPos = center - (center * (radioval / 100));
     let endPos = center + (center * (radioval / 100));

     xAxis.zoom({start:startPos, end:endPos});
  });


}


function callAidosMarketOrderbookApi() {
  fetch('https://aidosmarket.com/api/order-book',
    { mode:"cors" })
    .then(response => {
      if(response.ok) {
        return response.json();
      } else {
        throw new Error();
      }
    })
    .then(json => {
      mapperOrderbook(json["order-book"]);
    })
    .catch(error => console.log(error));
}
