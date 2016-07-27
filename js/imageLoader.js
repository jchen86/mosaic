var imageLoader = (function () {
  'use strict';

  return {
    /**
     * Create an Image Element from a file and returns a promise that resolves when image is loaded.
     * @param file
     * @returns {Promise.<Image>}
     */
    fromFile: function (file) {
      return readFile(file).then(loadImage);
    },
    /**
     * Load an image at a specified URL and returns a promise that resolves when image is loaded.
     * @param file
     * @returns {Promise.<Image>}
     */
    fromSrc: loadImage
  };

  function readFile(file) {
    return new Promise(function (resolve) {
      var fileReader = new FileReader();
      fileReader.onload = function (event) {
        resolve(event.target.result);
      };
      fileReader.readAsDataURL(file);
    })
  }

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var image = new Image();
      image.onload = function () {
        resolve(image);
      };
      image.onerror = function () {
        reject('Error loading image: ' + src);
      };
      image.src = src;
    })
  }

})();