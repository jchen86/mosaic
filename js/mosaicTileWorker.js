importScripts('colorCalculator.js');

/**
 * This message listener receives data from the main thread about a specific row on a canvas element, computes average
 * color of each tile using `colorCalculator` and returns a list containing average colors of each tile on the row.
 * @param {Object} message
 * @param {Uint8ClampedArray} message.data: image data of a <canvas> element
 * @param {Number} message.rowIndex: row of the tiles on the image to be computed
 * @param {Number} message.tileWidth: width of each tile
 * @param {Number} message.tileHeight height of each tile
 */
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