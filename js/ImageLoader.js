var imageLoader = (function () {
  'use strict';

  return {
    fromFile: function(file) {
      return readFile(file).then(loadImage);
    },
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
      image.onload = function (event) {
        resolve(image);
      };
      image.onerror = function () {
        reject('Error loading image: ' + src);
      };
      image.src = src;
    })
  }
  
})();