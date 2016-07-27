describe('workerMessageQueueFactory', function () {
  'use strict';
  var workerMessageQueue, numberOfWorkers;

  beforeEach(function () {
    spyOn(window, 'addEventListener').and.callThrough();
    spyOn(window, 'Worker').and.callFake(function () {
      return jasmine.createSpyObj('worker', ['addEventListener', 'postMessage', 'terminate']);
    });
    numberOfWorkers = 3;
    workerMessageQueue = workerMessageQueueFactory.init('aScript.js', numberOfWorkers);
  });

  describe('initialising a workerMessageQueue', function () {
    it('should create workers with the specified script', function () {
      expect(window.Worker).toHaveBeenCalledWith('aScript.js');
    });

    it('should create a number of watchers matching the specified number', function () {
      expect(window.Worker).toHaveBeenCalledTimes(numberOfWorkers);
    });

    it('should make all workers available', function () {
      expect(workerMessageQueue.availableWorkers.length).toBe(numberOfWorkers);
    });
  });

  describe('posting messages to workerMessageQueue', function () {
    var numOfMessages, promises;

    beforeEach(function () {
      numOfMessages = 5;
      promises = [];
      for (var i = 0; i < numOfMessages; i++) {
        var transferList = [i];
        var promise = workerMessageQueue.postMessage({messageId: i}, transferList);
        promises.push(promise);
      }
    });

    it('should distribute the messages to available workers in order', function () {
      for (var i = 0; i < numberOfWorkers; i++) {
        expect(workerMessageQueue.workers[i].postMessage).toHaveBeenCalledWith({messageId: i}, [i]);
      }
    });

    it('should put the pending messages into the queue', function () {
      var expectedNumOfMsgInQueue = numOfMessages - numberOfWorkers;
      expect(workerMessageQueue.queue.length).toBe(expectedNumOfMsgInQueue);
    });

    describe('when a message is received from worker', function () {
      var secondWorker, postMessagePromise, response, promiseCallback;

      beforeEach(function (done) {
        var workerIndex = 1;
        secondWorker = workerMessageQueue.workers[workerIndex];
        secondWorker.postMessage.calls.reset();
        postMessagePromise = promises[workerIndex];
        promiseCallback = jasmine.createSpy('promiseCallback').and
          .callFake(function () {
            done()
          });
        postMessagePromise.then(promiseCallback);
        response = 'completed!';
        resolveWorkerMessage(workerIndex, response);
      });

      it('should resolve the corresponding promise with response message passed to the callback', function () {
        expect(promiseCallback).toHaveBeenCalledWith(response);
      });

      it('should take next item from the queue for processing', function () {
        expect(secondWorker.postMessage).toHaveBeenCalledWith({messageId: 3}, [3]);
      });

      it('should remove the next item from the queue', function () {
        expect(workerMessageQueue.queue.length).toBe(1);
      });
    });

    describe('when all messages in the queue have been processed', function () {
      var workers;

      beforeEach(function () {
        workers = workerMessageQueue.workers;
        for (var msgIndex = 0; msgIndex < numOfMessages; msgIndex++) {
          resolveWorkerMessage(msgIndex % numberOfWorkers);
        }
      });

      it('should terminate all workers', function () {
        for (var i = 0; i < numberOfWorkers; i++) {
          expect(workers[i].terminate).toHaveBeenCalled();
        }
      })
    });
  });

  describe('tearing down a workerMessageQueue', function () {
    it('should terminate all workers', function () {
      var workers = workerMessageQueue.workers;
      workerMessageQueue.tearDown();
      for (var i = 0; i < numberOfWorkers; i++) {
        expect(workers[i].terminate).toHaveBeenCalled();
      }
    });
  });

  it('should terminated workers on window unload event', function () {
    var workers = workerMessageQueue.workers;
    var unloadEventHandler = window.addEventListener.calls.mostRecent().args[1];
    unloadEventHandler.call(workerMessageQueue);

    for (var i = 0; i < numberOfWorkers; i++) {
      expect(workers[i].terminate).toHaveBeenCalled();
    }
  });

  function resolveWorkerMessage(workerIndex, response) {
    var worker = workerMessageQueue.workers[workerIndex];
    var workerMsgHandler = worker.addEventListener.calls.mostRecent().args[1];
    workerMsgHandler({data: {result: response}});
  }
});