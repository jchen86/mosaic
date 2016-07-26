var mosaicFactory = (function () {
  'use strict';

  var numOfWorkers = 3;
  var tileProcessingQueue = workerMessageQueueFactory.init('js/mosaicTileWorker.js', numOfWorkers);
  var cachedTiles = {};

  var Mosaic = {
    init: init,
    render: render
  };

  return {
    create: function (image, outputElement, tileWidth, tileHeight) {
      var mosaic = Object.create(Mosaic).init(image, tileWidth, tileHeight);
      return mosaic.render(outputElement);
    }
  };

  function init(image, tileHeight, tileWidth) {
    this.origCanvas = createImageCanvas(image);
    this.numOfRows = Math.floor(this.origCanvas.height / tileHeight);
    this.numOfCols = Math.floor(this.origCanvas.width / tileWidth);
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.numOfCols * tileWidth;
    this.canvas.height = this.numOfRows * tileHeight;
    this.context = this.canvas.getContext('2d');
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.processingComplete = processImageData.call(this);
    return this;
  }

  function render(outputElement) {
    outputElement.appendChild(this.canvas);
    return this.processingComplete;
  }

  function createImageCanvas(image) {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    context.drawImage(image, 0, 0, image.width, image.height);
    return canvas;
  }

  function processImageData() {
    var origImageData = this.origCanvas.getContext('2d').getImageData(0, 0, this.canvas.width, this.canvas.height);
    var allRowsTiles = [];

    for (var rowIndex = 0; rowIndex < this.numOfRows; rowIndex++) {
      var rowImageData = {
        imageData: origImageData,
        rowIndex: rowIndex,
        numOfCols: this.numOfCols,
        tileWidth: this.tileWidth,
        tileHeight: this.tileHeight
      };

      var rowTilesResolved = tileProcessingQueue
        .postMessage(rowImageData)
        .then(fetchTiles);

      allRowsTiles.push(rowTilesResolved);
    }

    return drawMosaicFromTop.call(this, allRowsTiles);
  }

  function fetchTiles(tileColors) {
    var loadImagePromises = tileColors.map(getTileByHexColor);
    return Promise.all(loadImagePromises);
  }

  function drawMosaicFromTop(allRowsTiles) {
    var mosaic = this;
    var drawRowWhenReady = function (prevRowRendered, currRowTilesResolved, rowIndex) {
      return prevRowRendered
        .then(function () {
          return currRowTilesResolved;
        })
        .then(drawRow.bind(mosaic, rowIndex))
    };
    return allRowsTiles.reduce(drawRowWhenReady, Promise.resolve());
  }

  function drawRow(rowIndex, tileImages) {
    tileImages.forEach(function drawTile(tile, tileIndex) {
      this.context.drawImage(tile, tileIndex * this.tileWidth, rowIndex * this.tileHeight);
    }.bind(this));
    return Promise.resolve();
  }

  function getTileByHexColor(hexColor) {
    var cached = cachedTiles[hexColor];

    if (cached) {
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

})();