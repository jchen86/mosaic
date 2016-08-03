var colorCalculator = (function () {
  'use strict';

  return {
    /**
     * This method computes the average color of a tile at specified position and returns an object containing rgb values.
     * @param imageData: pixel data of a <canvas> element
     * @param rowIndex: vertical position of the tile
     * @param colIndex: horizontal position of the tile
     * @param tileWidth: width of each tile
     * @param tileHeight: height of each tile
     * @returns an object containing the r,g,b values of the color
     */
    getTileAverageColor: getTileAverageColor,
    /**
     * This method computes the average color of a tile at specified position and returns the hexadecimal color.
     * @param imageData: pixel data of a <canvas> element
     * @param rowIndex: vertical position of the tile
     * @param colIndex: horizontal position of the tile
     * @param tileWidth: width of each tile
     * @param tileHeight: height of each tile
     * @returns a hex color string
     */
    getTileAverageColorAsHex: getTileAverageColorAsHex
  };

  function getTileAverageColor(imageData, rowIndex, colIndex, tileWidth, tileHeight) {
    var startX = colIndex * tileWidth;
    var startY = rowIndex * tileHeight;
    var pixels = tileWidth * tileHeight;
    var totalRgb = {r: 0, g: 0, b: 0};
    var dataArray = imageData.data;

    for(var innerRow = 0; innerRow < tileHeight; innerRow++) {
      var rowStartIndex = imageData.width * (rowIndex * tileHeight) * 4 + startX * 4 + imageData.width * innerRow * 4;

      for(var col = 0; col < tileWidth; col ++) {
        var index = rowStartIndex + col * 4;
        totalRgb.r += dataArray[index];
        totalRgb.g += dataArray[index + 1];
        totalRgb.b += dataArray[index + 2];
      }

    }

    return {
      r: Math.round(totalRgb.r / pixels),
      g: Math.round(totalRgb.g / pixels),
      b: Math.round(totalRgb.b / pixels)
    }
  }

  function getTileAverageColorAsHex(imageData, rowIndex, colIndex, tileWidth, tileHeight) {
    var rgb = getTileAverageColor(imageData, rowIndex, colIndex, tileWidth, tileHeight);
    return rgbToHex(rgb)
  }

  function rgbToHex(rgb) {
    return [rgb.r, rgb.g, rgb.b]
      .map(function (x) {
        x = parseInt(x).toString(16);
        return (x.length === 1) ? '0' + x : x;
      })
      .join('');
  }

})();