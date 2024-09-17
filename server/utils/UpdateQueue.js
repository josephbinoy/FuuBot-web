export default class UpdateQueue {
    constructor() {
      this.queue = Promise.resolve();
    }
  
    addToQueue(operation) {
      this.queue = this.queue.then(operation, operation);
    }
}