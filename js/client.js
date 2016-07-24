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
        readFile(file)
          .then(loadImage)
          .then(createMosaic);
      }
    }

    function readFile(file) {
      return new Promise(function (resolve) {
        var fileReader = new FileReader();
        fileReader.onload = function (event) {
          resolve(event.target.result);
        };
        fileReader.readAsDataURL(file);
      })
    }

    function loadImage(file) {
      return new Promise(function (resolve) {
        var img = new Image();
        img.onload = function (event) {
          resolve(event.target);
        };
        img.src = file;
      })
    }

    function createMosaic(img) {
      outputElement.innerHTML = '';
      mosaicFactory.create(img, outputElement, TILE_WIDTH, TILE_HEIGHT);
    }

  };

})();