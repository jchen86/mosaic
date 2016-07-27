var workerMessageQueueFactory = (function () {
  'use strict';
  var defaultNumOfWorkers = 4;

  var WorkerMessageQueue = {
    init: function (script, numOfWorkers) {
      this.numOfWorkers = numOfWorkers || defaultNumOfWorkers;
      this.script = script;
      this.workers = createWorkers.call(this, script, numOfWorkers);
      this.availableWorkers = this.workers.slice();
      this.messageCount = 0;
      this.queue = [];
      this.processing = {};
      window.addEventListener('unload', terminateWorkers.bind(this));
      return this;
    },

    postMessage: function (message, transferList) {
      var args = arguments;
      if(!this.workers.length) {
        this.init(this.script, this.numOfWorkers);
      }

      return new Promise(function (resolve) {
        var id = ++this.messageCount;
        this.queue.push({id: id, message: args, resolve: resolve});
        processQueue.call(this);
      }.bind(this));
    },

    tearDown: terminateWorkers
  };

  return {
    /**
     * Creates an instance of workerMessageQueue. 
     *
     * @param jsFile: script to be executed in the worker thread
     * @param numOfWorkers: number of works to instantiate
     * @returns {WorkerMessageQueue}
     */
    init: function (jsFile, numOfWorkers) {
      return Object.create(WorkerMessageQueue).init(jsFile, numOfWorkers);
    }
  };

  function createWorkers(jsFile, numOfWorkers) {
    var workers = [];

    for (var i = 0; i < numOfWorkers; i++) {
      var worker = new Worker(jsFile);
      worker.addEventListener('message', workerMsgHandler.bind(this, worker));
      workers.push(worker);
    }
    return workers;
  }

  function processQueue() {
    var isIdle = !Object.keys(this.processing).length;

    if(this.queue.length === 0 && isIdle) {
      this.tearDown();
      return;
    }

    while (this.availableWorkers.length > 0 && this.queue.length > 0) {
      var worker = this.availableWorkers.shift();
      var work = this.queue.shift();
      this.processing[work.id] = work;
      worker.workId = work.id;
      worker.postMessage.apply(worker, work.message);
    }
  }

  function workerMsgHandler(worker, message) {
    var work = this.processing[worker.workId];
    work.resolve(message.data.result);

    delete this.processing[worker.workId];
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
    this.queue = [];
    this.processing = {};
  }
})();