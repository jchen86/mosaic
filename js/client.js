(function () {
  'use strict';

  window.onload = function () {
    var inputElement = document.getElementById('input');
    var outputElement = document.getElementById('output');
    var messageElement = document.getElementById('message');
    var imageTypeRegex = /^image\//;

    inputElement.addEventListener('change', fileChangeListener);

    function fileChangeListener() {
      clearContents();

      var file = this.files[0];
      if (imageTypeRegex.test(file.type)) {
        imageLoader.fromFile(file)
          .then(createMosaic)
          .then(function () {
            messageElement.innerHTML = 'Photo mosaic successfully created.';
          });
      } else {
        messageElement.innerHTML = `Incorrect file type: ${file.type}`;
      }
    }

    function clearContents() {
      messageElement.innerHTML = '';
      outputElement.innerHTML = '';
    }

    function createMosaic(image) {
      var mosaic = mosaicFactory.create(image, TILE_WIDTH, TILE_HEIGHT);
      outputElement.appendChild(mosaic.canvas);
      return mosaic.processingComplete;
    }
  };

})();