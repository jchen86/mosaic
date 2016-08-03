var mosaicFactory = (function () {
  'use strict';

  var numOfWorkers = 2;
  var tileProcessingQueue;

  var Mosaic = {
    init: init,
    drawMosaicFromTop: drawMosaicFromTop
  };

  return {
    /**
     * Creates a photo mosaic from a given image. The image is divided into tiles, and each tile is replaced with an image
     * retrieved from the server that matches the average color of the tile.
     * @param image an <Image> element
     * @param tileWidth width of each tile, must be a number greater than 0.
     * @param tileHeight height of each tile, must be a number greater than 0.
     * @returns an object containing the canvas element
     */
    create: function (image, tileWidth, tileHeight) {
      checkArguments.apply(null, arguments);
      return Object.create(Mosaic).init(image, tileWidth, tileHeight);
    },

    Mosaic: Mosaic
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
    this.cachedTiles = {};
    this.processingComplete = processImageData.call(this);
    return this;
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
    this.origImageData = this.origCanvas.getContext('2d').getImageData(0, 0, this.canvas.width, this.canvas.height);
    var allRowsTiles = [];

    for (var rowIndex = 0; rowIndex < this.numOfRows; rowIndex++) {
      var tilesForTheRow = [];

      for (var colIndex = 0; colIndex < this.numOfCols; colIndex++) {
        tileProcessingQueue = tileProcessingQueue || workerMessageQueueFactory.init('js/mosaicTileWorker.js', numOfWorkers);
        // var startIndex = this.canvas.width * rowIndex *
        // var image = this.origImageData.slice(rowIndex);
        var tileAverageColor = tileProcessingQueue.postMessage({
          imageData: this.origImageData,
          rowIndex: rowIndex,
          colIndex: colIndex,
          tileWidth: this.tileWidth,
          tileHeight: this.tileHeight
        }).then(getTileByHexColor.bind(this));
        tilesForTheRow.push(tileAverageColor);

      }

      allRowsTiles.push(Promise.all(tilesForTheRow));
    }

    return drawMosaicFromTop.call(this, allRowsTiles);
  }

  function calculateTileColors (rowIndex) {
    if(numOfWorkers > 0) {
      return calculateTileColorsWithWorkers.call(this, rowIndex);
    }

    var tileColors = [];

    for (var colIndex = 0; colIndex < this.numOfCols; colIndex++) {
      var avgColorHex = colorCalculator.getTileAverageColorAsHex(this.origImageData, rowIndex, colIndex, this.tileWidth, this.tileHeight);
      tileColors.push(avgColorHex);
    }
    return Promise.resolve(tileColors);
  }

  function calculateTileColorsWithWorkers(rowIndex) {
    var rowImageData = {
      rowIndex: rowIndex,
      imageData: this.origImageData,
      numOfCols: this.numOfCols,
      tileWidth: this.tileWidth,
      tileHeight: this.tileHeight
    };
    tileProcessingQueue = tileProcessingQueue || workerMessageQueueFactory.init('js/mosaicTileWorker.js', numOfWorkers);
    return tileProcessingQueue.postMessage(rowImageData);
  }

  function fetchTiles(tileColor) {
    var loadTilesPromises = tileColor.map(getTileByHexColor.bind(this));
    return Promise.all(loadTilesPromises);
  }

  function drawMosaicFromTop(allRowsTiles) {
    var mosaic = this;
    return allRowsTiles.reduce(drawRowWhenReady, Promise.resolve());

    function drawRowWhenReady(prevRowRendered, currRowTilesResolved, rowIndex) {
      return prevRowRendered
        .then(function () {
          return currRowTilesResolved;
        })
        .then(drawRow.bind(mosaic, rowIndex))
    }
  }

  function drawRow(rowIndex, tileImages) {
    tileImages.forEach(function (tile, tileIndex) {
      this.context.drawImage(tile, tileIndex * this.tileWidth, rowIndex * this.tileHeight);
    }.bind(this));
    return Promise.resolve();
  }

  function getTileByHexColor(hexColor) {
    var cached = this.cachedTiles[hexColor];

    if (cached) {
      return cached;
    }

    var promise = imageLoader.fromSrc('/color/' + hexColor);
    this.cachedTiles[hexColor] = promise;
    return promise;
  }

  function checkArguments(image, tileWidth, tileHeight) {
    var errors = [];
    if(!(image instanceof HTMLImageElement)) {
      errors.push('image must be a HTMLImageElement')
    }
    if(!isNumberGreaterThanZero(tileWidth)) {
      errors.push('tileWidth must be a number greater than 0')
    }
    if(!isNumberGreaterThanZero(tileHeight)) {
      errors.push('tileWidth must be an integer')
    }
    if(errors.length) {
      throw new TypeError(`Unable to create mosaic: ${errors.join(', ')}`)
    }
  }

  function isNumberGreaterThanZero(num) {
    return !!num && num > 0;
  }

})();