var mosaicFactory = (function () {
  'use strict';

  return {
    create: function (image, outputElement, tileWidth, tileHeight) {
      var origImgCanvas = createImageCanvas(image);
      var tiledCanvas = createTiledCanvas(origImgCanvas, tileWidth, tileHeight);
      outputElement.appendChild(tiledCanvas);
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

  function createTiledCanvas(originalCanvas, tileWidth, tileHeight) {
    var numOfRows = Math.floor(originalCanvas.height / tileHeight);
    var numOfCols = Math.floor(originalCanvas.width / tileWidth);
    var tiledCanvas = document.createElement('canvas');
    var tiledContext = tiledCanvas.getContext('2d');
    tiledCanvas.width = numOfCols * tileWidth;
    tiledCanvas.height = numOfRows * tileHeight;

    var imageData = originalCanvas.getContext('2d').getImageData(0, 0, originalCanvas.width, originalCanvas.height);

    for (var rowIndex = 0; rowIndex < numOfRows; rowIndex++) {
      var rowTiles = [];

      for (var colIndex = 0; colIndex < numOfCols; colIndex++) {
        var avgColorHex = colorCalculator.getTileAverageColorAsHex(imageData, rowIndex, colIndex, tileWidth, tileHeight);
        rowTiles.push(getTileByHexColor(avgColorHex));
      }

      drawRow(tiledContext, rowTiles, rowIndex, tileWidth, tileHeight);
    }

    return tiledCanvas;
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