class Lock {
  /**
   * Creates a new lock with a map to store keys of items which
   * should be locked
   */
  constructor() {
    this.locks = new Map();
  }

  /**
   * Find out where a key is currently being operated on,
   * if so continue checking until it is free and see a new lock.
   *
   * @param {string} key - identifier of the data to be operated on
   * @param {boolean} read - where the operation is read/write
   */
  acquireLock = async (key, read = false) => {
    while (this.locks.has(key))
      await new Promise((resolve) => newTimeout(resolve, 10));
    if (!read) this.locks.set(key, true);
  };

  /**
   * Remove the lock on the item
   *
   * @param {string} key // identifier of the lock to be released
   */
  releaseLock = (key) => {
    this.locks.delete(key);
  };
}
module.exports = Lock;
