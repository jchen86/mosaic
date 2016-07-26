importScripts('colorCalculator.js');

addEventListener('message', function messageHandler(message) {
  var data = message.data;
  var imageData = data.imageData;
  var rowIndex = data.rowIndex;
  var numOfCols = data.numOfCols;
  var tileWidth = data.tileWidth;
  var tileHeight = data.tileHeight;
  var tileColors = [];

  for (var colIndex = 0; colIndex < numOfCols; colIndex++) {
    var avgColorHex = colorCalculator.getTileAverageColorAsHex(imageData, rowIndex, colIndex, tileWidth, tileHeight);
    tileColors.push(avgColorHex);
  }

  postMessage({result: tileColors});
});