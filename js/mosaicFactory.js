var mosaicFactory = (function () {
  'use strict';

  return {
    create: function (image, outputElement, tileWidth, tileHeight) {
      var origImgCanvas = createImageCanvas(image);
      var mosaicCanvas = createMosaicCanvas(origImgCanvas, tileWidth, tileHeight);
      outputElement.appendChild(mosaicCanvas);
    }
  };

  function createImageCanvas(image) {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    context.drawImage(image, 0, 0, image.width, image.height);
    return canvas;
  }

  function createMosaicCanvas(origCanvas, tileWidth, tileHeight) {
    var mosaicCanvas = document.createElement('canvas');
    var mosaicContext = mosaicCanvas.getContext('2d');
    var numOfRows = Math.floor(origCanvas.height / tileHeight);
    var numOfCols = Math.floor(origCanvas.width / tileWidth);
    mosaicCanvas.width = numOfCols * tileWidth;
    mosaicCanvas.height = numOfRows * tileHeight;

    var origImgData = origCanvas.getContext('2d').getImageData(0, 0, origCanvas.width, origCanvas.height);

    for (var rowIndex = 0; rowIndex < numOfRows; rowIndex++) {
      var rowTiles = [];

      for (var colIndex = 0; colIndex < numOfCols; colIndex++) {
        var avgColorHex = colorCalculator.getTileAverageColorAsHex(origImgData, rowIndex, colIndex, tileWidth, tileHeight);
        rowTiles.push(getTileByHexColor(avgColorHex));
      }

      drawRow(mosaicContext, rowTiles, rowIndex, tileWidth, tileHeight);
    }

    return mosaicCanvas;
  }

  function getTileByHexColor(hexColor) {
    return new Promise(function (resolve, reject) {
      var image = new Image();
      image.onload = function () {
        resolve(image);
      };
      image.onerror = function () {
        reject('Error loading image: ' + image.src);
      };
      image.src = '/color/' + hexColor;
    });
  }

  function drawRow(context, rowTiles, rowIndex, tileWidth, tileHeight) {
    return Promise.all(rowTiles)
      .then(function renderTiles(tiles) {
        tiles.forEach(function (tile, tileIndex) {
          context.drawImage(tile, tileIndex * tileWidth, rowIndex * tileHeight);
        });
      })
  }

})();