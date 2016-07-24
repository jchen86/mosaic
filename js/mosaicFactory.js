var mosaicFactory = (function () {
  'use strict';
  var numOfWorkers = 3;
  var cachedTiles = {};

  return {
    create: function (image, outputElement, tileWidth, tileHeight) {
      window.startTime = performance.now();
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
    var tileProcessingQueue = workerMessageQueueFactory.init('js/mosaicTileWorker.js', numOfWorkers);
    var tileProcessingSize = Math.floor(numOfCols / numOfWorkers);
    var allRows = [];

    for (var rowIndex = 0; rowIndex < numOfRows; rowIndex++) {
      var tilesProcessingPromises = [];

      for (var index = 0; index < numOfWorkers; index++) {
        var promise = tileProcessingQueue.postMessage({
          imageData: origImgData,
          rowIndex: rowIndex,
          startColIndex: index * tileProcessingSize,
          endColIndex: Math.min((index + 1) * tileProcessingSize, numOfCols),
          tileWidth: tileWidth,
          tileHeight: tileHeight
        });
        tilesProcessingPromises.push(promise);
      }

      // TODO chain promises
      allRows.push(drawRow(mosaicContext, tilesProcessingPromises, rowIndex, tileWidth, tileHeight));
    }

    //REMOVE
    Promise.all(allRows).then(function () {
      var endTime = performance.now();
      console.log(`Drawing took ${endTime - startTime} ms.`)
    });

    return mosaicCanvas;
  }

  function drawRow(context, tilesProcessingPromises, rowIndex, tileWidth, tileHeight) {
    return Promise.all(tilesProcessingPromises)
      .then(function loadImage(response) {
        var tileColors = flattenArray(response);
        var loadImagePromises = tileColors.map(getTileByHexColor);
        return Promise.all(loadImagePromises);
      })
      .then(function drawImage(tileImages) {
        tileImages.forEach(function (tile, tileIndex) {
          context.drawImage(tile, tileIndex * tileWidth, rowIndex * tileHeight);
        });
        return Promise.resolve();
      });
  }

  function getTileByHexColor(hexColor) {
    var cached = cachedTiles[hexColor];

    if(cached) {
      return cached;
    }

    var promise = new Promise(function (resolve, reject) {
      var image = new Image();
      image.onload = function () {
        resolve(image);
      };
      image.onerror = function () {
        reject('Error loading image: ' + image.src);
      };
      image.src = '/color/' + hexColor;
    });
    cachedTiles[hexColor] = promise;
    return promise;
  }

  function flattenArray(array) {
    return array.reduce(function (previous, current) {
      return previous.concat(current);
    })
  }

})();