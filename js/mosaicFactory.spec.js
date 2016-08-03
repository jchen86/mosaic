describe('mosaicFactory', function () {
  'use strict';
  var workerMessageQueueMock, mosaic, opts, image;

  beforeEach(function () {
    opts = {
      tileWidth: 10,
      tileHeight: 10,
      imageWidth: 100,
      imageHeight: 150,
      numOfRows: 10,
      numOfCols: 15
    };

    image = document.createElement('img');
    image.width = opts.imageWidth;
    image.height = opts.imageHeight;

    workerMessageQueueMock = jasmine.createSpyObj('tileProcessingQueue', ['postMessage']);
    workerMessageQueueMock.postMessage.and.callFake(function (message) {
      var numOfResults = message.numOfCols;
      var filledArray = new Array(numOfResults).fill('fffff');
      return Promise.resolve(filledArray);
    });

    spyOn(workerMessageQueueFactory, 'init').and.returnValue(workerMessageQueueMock);
    spyOn(CanvasRenderingContext2D.prototype, 'drawImage');
    spyOn(CanvasRenderingContext2D.prototype, 'getImageData');
    spyOn(imageLoader, 'fromSrc').and.returnValue(Promise.resolve(['anImage']));
  });

  describe('verify mosaic is rendered from the top', function () {
    var allRowTiles, allRowTilesResolveFn, mockInstance, promise;

    beforeEach(function () {
      allRowTiles = [];
      allRowTilesResolveFn = [];

      for(var i =0; i <2; i++) {
        allRowTiles.push(new Promise(function(resolve) {
          allRowTilesResolveFn.push(resolve);
        }));
      }
      mockInstance = {context: jasmine.createSpyObj('context', ['drawImage'])};
      promise = mosaicFactory.Mosaic.drawMosaicFromTop.call(mockInstance, allRowTiles);
    });

    it('should not draw the 2nd row when first row is not resolved', function () {
      allRowTilesResolveFn[1].call();
      expect(CanvasRenderingContext2D.prototype.drawImage).not.toHaveBeenCalled();
    });

    fit('should draw 1st and 2nd row when tiles for both rows are resolved', function (done) {
      allRowTilesResolveFn[0](['firstImage']);
      allRowTilesResolveFn[1](['2ndRowImage']);
      promise.then(function () {
        expect(mockInstance.context.drawImage).toHaveBeenCalledTimes(2);
        done();
      });
    });


  });

  describe('when valid data is provided', function () {
    beforeEach(function (done) {
      mosaic = mosaicFactory.create(image, opts.tileWidth, opts.tileHeight);
      mosaic.context.drawImage.calls.reset();
      mosaic.processingComplete.then(function () {
        done()
      });
    });

    it('should create a canvas from an image', function () {
      expect(mosaic.canvas instanceof HTMLCanvasElement).toBe(true);
    });

    it('should create a canvas that matches the original width', function () {
      expect(mosaic.canvas.width).toBe(100);
    });

    it('should create a canvas that matches the original hegight', function () {
      expect(mosaic.canvas.height).toBe(150);
    });

    it('should have drawn 10 x 15 tiles on the canvas when processing is completed', function () {
      expect(mosaic.context.drawImage).toHaveBeenCalledTimes(10 * 15);
    });
  });

  describe('when invalid data is provided', function () {
    it('should throw an error if missing arguments', function () {
      expect(function () {
        mosaicFactory.create();
      }).toThrowError();
    });

    it('should throw an error if image is invalid', function () {
      expect(function () {
        mosaicFactory.create({}, opts.tileWidth, opts.tileHeight);
      }).toThrowError();
    });

    it('should throw an error if tileWidth is invalid', function () {
      expect(function () {
        mosaicFactory.create(image, 'abc', opts.tileHeight);
      }).toThrowError();
    });

    it('should throw an error if tileHeight is invalid', function () {
      expect(function () {
        mosaicFactory.create(image, opts.tileWidth, 0);
      }).toThrowError();
    });
  })
});