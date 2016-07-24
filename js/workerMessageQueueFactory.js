var workerMessageQueueFactory = (function () {
  'use strict';
  var defaultNumOfWorkers = 4;

  var WorkerMessageQueue = {
    init: function (jsFile, numOfWorkers) {
      numOfWorkers = numOfWorkers || defaultNumOfWorkers;
      this.workers = createWorkers.call(this, jsFile, numOfWorkers);
      this.availableWorkers = this.workers.slice();
      this.messageCount = 0;
      this.queue = [];
      this.inProgress = {};
      window.addEventListener('unload', terminateWorkers.bind(this));
      return this;
    },

    postMessage: function (message, transferList) {
      var args = arguments;

      return new Promise(function (resolve) {
        var id = ++this.messageCount;
        this.queue.push({id: id, message: args, resolve: resolve});
        processQueue.call(this);
      }.bind(this));
    },

    tearDown: terminateWorkers
  };

  return {
    init: function (jsFile, numOfWorkers) {
      return Object.create(WorkerMessageQueue).init(jsFile, numOfWorkers);
    }
  };

  function createWorkers(jsFile, numOfWorkers) {
    var workers = [];

    for (var i = 0; i < numOfWorkers; i++) {
      var worker = new Worker(jsFile);
      worker.onmessage = workerMsgHandler.bind(this, worker);
      workers.push(worker);
    }
    return workers;
  }

  function processQueue() {
    if(this.queue.length === 0) {
      this.tearDown();
      return;
    }

    while (this.availableWorkers.length > 0 && this.queue.length > 0) {
      var worker = this.availableWorkers.shift();
      var work = this.queue.shift();
      this.inProgress[work.id] = work;
      worker.workId = work.id;
      worker.postMessage.apply(worker, work.message);
    }
  }

  function workerMsgHandler(worker, message) {
    var work = this.inProgress[worker.workId];
    work.resolve(message.data.result);

    delete this.inProgress[worker.workId];
    worker.workId = null;

    this.availableWorkers.push(worker);
    processQueue.call(this);
  }

  function terminateWorkers() {
    this.workers.forEach(function (worker) {
      worker.terminate();
    });
    this.workers = [];
    this.availableWorkers = [];
  }
})();