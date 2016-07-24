importScripts('colorCalculator.js');

addEventListener('message', function messageHandler(message) {
  var data = message.data;
  var imageData = data.imageData;
  var rowIndex = data.rowIndex;
  var startColIndex = data.startColIndex;
  var endColIndex = data.endColIndex;
  var tileWidth = data.tileWidth;
  var tileHeight = data.tileHeight;
  var tileColors = [];

  for (var colIndex = startColIndex; colIndex < endColIndex; colIndex++) {
    var avgColorHex = colorCalculator.getTileAverageColorAsHex(imageData, rowIndex, colIndex, tileWidth, tileHeight);
    tileColors.push(avgColorHex);
  }

  postMessage({result: tileColors});
});