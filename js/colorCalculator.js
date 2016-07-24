var colorCalculator = (function () {
  'use strict';

  return {
    getTileAverageColor: getTileAverageColor,
    getTileAverageColorAsHex: getTileAverageColorAsHex
  };

  function getTileAverageColor(imageData, rowIndex, colIndex, tileWidth, tileHeight) {
    var startX = colIndex * tileWidth;
    var startY = rowIndex * tileHeight;
    var dataStartIndex = imageData.width * startY * 4 + startX * 4;
    var pixels = tileWidth * tileHeight;
    var dataLength = pixels * 4;
    var totalRgb = {r: 0, g: 0, b: 0};
    var dataArray = imageData.data;

    for (var i = 0; i < dataLength; i += 4) {
      totalRgb.r += dataArray[dataStartIndex];
      totalRgb.g += dataArray[dataStartIndex + 1];
      totalRgb.b += dataArray[dataStartIndex + 2];
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