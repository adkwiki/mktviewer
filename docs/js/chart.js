function mapperChart(candles) {

  // save before 24h close
  var close = undefined;
  for (let candle of candles) {
    if (candle["close"]) {
      close = candle["close"];
    }

    if (moment(candle.date).format("X") === getAmBefore24hMoment().format("X")) {
      setAmBefore24hPrice(close);
      break;
    }
  }

  // Themes begin
  am4core.useTheme(am4themes_animated);
  // Themes end

  var chart = am4core.create("candlestick_chart", am4charts.XYChart);

  // Date/time formatted according to ISO8601 format.
  // see https://www.amcharts.com/docs/v4/concepts/formatters/formatting-date-time/
  chart.dateFormatter.inputDateFormat = "i";

  var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
  dateAxis.renderer.grid.template.location = 0;
  dateAxis.renderer.minGridDistance = 25;
  dateAxis.dateFormatter = new am4core.DateFormatter();
  dateAxis.dateFormatter.dateFormat = "MM/dd HH:00";

  dateAxis.dateFormats.setKey("hour", "HH:00");
  dateAxis.periodChangeDateFormats.setKey("hour", "HH:00\nMM/dd");

  var valueColumnAxis = chart.yAxes.push(new am4charts.ValueAxis());
  valueColumnAxis.tooltip.disabled = true;
  valueColumnAxis.renderer.grid.template.disabled = true;
  valueColumnAxis.renderer.labels.template.disabled = true;
  valueColumnAxis.extraMax = 2;
  valueColumnAxis.fillOpacity = 0.5;

  var columnSeries = chart.series.push(new am4charts.ColumnSeries());
  columnSeries.yAxis = valueColumnAxis;
  columnSeries.dataFields.valueY = "volume";
  columnSeries.dataFields.dateX = "date";

  var valueCalndleAxis = chart.yAxes.push(new am4charts.ValueAxis());
  valueCalndleAxis.tooltip.disabled = true;
  valueCalndleAxis.renderer.minGridDistance = 10;
  valueCalndleAxis.numberFormatter.numberFormat = "#.00000";

  var series = chart.series.push(new am4charts.CandlestickSeries());
  series.yAxis = valueCalndleAxis;
  series.dataFields.dateX = "date";
  series.dataFields.valueY = "close";
  series.dataFields.openValueY = "open";
  series.dataFields.lowValueY = "low";
  series.dataFields.highValueY = "high";
  series.simplifiedProcessing = true;
  //series.tooltipText = "Open:${openValueY.value}\nLow:${lowValueY.value}\nHigh:${highValueY.value}\nClose:${valueY.value}";

  series.dropFromOpenState.properties.fill = am4core.color("#D9544F");
  series.dropFromOpenState.properties.stroke = am4core.color("#D9544F");

  series.riseFromOpenState.properties.fill = am4core.color("#0FB387");
  series.riseFromOpenState.properties.stroke = am4core.color("#0FB387");

  series.riseFromPreviousState.properties.fillOpacity = 1;
  series.dropFromPreviousState.properties.fillOpacity = 0;


  chart.data = candles;
}

// ex https://aidosmarket.com/chart?from=1564574400&to=1564754400&resolution=60

function callAidosMarketChartApi() {

  // generate from(truncate min, sec +1h) - to(from -48h)
  var to = moment();
  to.minute(0);
  to.second(0);
  to.add(1, 'hours');

  setAmBefore24hMoment(to.clone().add(-24, 'hours'));

  var from = to.clone().add(-48, 'hours');

  let from_unixtime = from.format("X");
  let to_unixtime = to.format("X");

  fetch('https://aidosmarket.com/chart?from=' + from_unixtime + '&to=' + to_unixtime + '&resolution=60',
    { mode:"cors" })
    .then(response => {
      if(response.ok) {
        return response.json();
      } else {
        throw new Error();
      }
    })
    .then(json => {
      mapperChart(json);
      mapperAmChangePer();
    })
    .catch(error => console.log(error));
}
