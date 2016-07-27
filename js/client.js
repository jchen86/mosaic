(function () {
  'use strict';

  window.onload = function () {
    var inputElement = document.getElementById('input');
    var outputElement = document.getElementById('output');
    var imageTypeRegex = /^image\//;

    inputElement.addEventListener('change', fileChangeListener);

    function fileChangeListener() {
      var file = this.files[0];
      if (imageTypeRegex.test(file.type)) {
        imageLoader.fromFile(file).then(createMosaic);
      } else {
        outputElement.innerHTML = `Incorrect file type: ${file.type}`;
      }
    }

    function createMosaic(image) {
      var mosaic = mosaicFactory.create(image, TILE_WIDTH, TILE_HEIGHT);
      outputElement.innerHTML = '';
      outputElement.appendChild(mosaic.canvas);
    }
  };

})();