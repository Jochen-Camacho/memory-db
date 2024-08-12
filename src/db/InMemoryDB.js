const LRUCache = require("../data_structs/LRUCache");
const BTree = require("../data_structs/BTree");
const Lock = require("./Lock");
const uuid = require("uuid");

class InMemoryDB {
  /**
   * Initialize our database, a Map for the data store, a Least Recently Used
   * Cache, an array of indexes initalized with an id index (as BTrees) and
   * a Lock for managing concurrency.
   */
  constructor() {
    this.data = new Map();
    this.cache = new LRUCache();
    this.indexes = { id: new BTree() };
    this.lock = new Lock();
  }

  /**
   * Add an item to the databased. Updates the cache, the data store,
   * the id index and any indexes that match any of the fields of the
   * value being created.
   *
   * @param {Object} value - Any item to be stored in the database
   * @returns {Object}
   */
  create = async (value) => {
    const id = uuid.v4();
    await this.lock.acquireLock(id);

    try {
      this.data.set(id, { id, ...value });
      this.cache.set(id, { id, ...value });
      this.indexes.id.insert(id, id);

      // Check the various indexes
      for (const index of Object.keys(this.indexes)) {
        if (value[index.toString()]) {
          console.log(value[index.toString()]);
          this.indexes[index.toString()].insert(value[index.toString()], id);
        }
      }

      return { id, ...value };
    } catch (error) {
      console.log(error);
    } finally {
      this.lock.releaseLock(id);
    }
  };

  /**
   * Retrieve a value from the either the cache, the id index
   * of the data store
   *
   * @param {string} key - Key of the value to be searched
   * @returns {Object}
   */
  findById = async (key) => {
    await this.lock.acquireLock(key, true);

    try {
      if (this.cache.get(key)) {
        // console.log("Found in Cache");
        return { id: key, ...this.cache.get(key) };
      }
      const keyFromIndex = this.indexes.id.search(key);
      if (keyFromIndex) {
        // console.log("Found in ID Index");
        return { id: key, ...this.data.get(this.indexes.id.search(key)) };
      }

      if (this.data.has(key)) {
        return { id: key, ...this.data.get(key) };
      }
      return { error: `No Data Found for ID: ${key}`, status: "FAILED" };
    } catch (error) {
      console.log(error);
    } finally {
      this.lock.releaseLock(key);
    }
  };

  /**
   * Remove a value from the the database
   *
   * @param {string} key - Key of value to be deleted
   * @returns {Object}
   */
  deleteById = async (key) => {
    await this.lock.acquireLock(key);

    try {
      if (this.data.has(key)) {
        this.data.delete(key);
      } else {
        return { error: `No Data Found for ID: ${key}`, status: "FAILED" };
      }

      if (this.cache.get(key)) {
        // console.log("Deleting From Cache");
        this.cache.delete(key);
      }

      const keyFromIndex = this.indexes.id.search(key);
      if (keyFromIndex) {
        // console.log("Deleting from ID Index");
        this.indexes.id.delete(keyFromIndex.key);
      }

      return { message: `Data deleted for ${key}`, status: "SUCCESS" };
    } catch (error) {
      console.log(error);
    } finally {
      this.lock.releaseLock(key);
    }
  };

  /**
   * Update a value in the database
   *
   * @param {string} key
   * @param {Object} value
   * @returns {Object}
   */
  updateById = async (key, value) => {
    await this.lock.acquireLock(key);

    try {
      if (this.data.has(key)) {
        this.data.set(key, { id: key, ...value });
      } else {
        return { error: `No Data Found for ID: ${key}`, status: "FAILED" };
      }

      if (this.cache.get(key)) {
        this.cache.set(key, value);
      }

      const keyFromIndex = this.indexes.id.search(key);
      if (keyFromIndex) {
        this.indexes.id.delete(keyFromIndex.key);
        this.indexes.id.insert(keyFromIndex.key, keyFromIndex.key);
      }

      return { message: `Data updated for ${key}`, status: "SUCCESS" };
    } catch (error) {
      console.log(error);
    } finally {
      this.lock.releaseLock(key);
    }
  };

  /**
   * Creates an index and populates it on data items that have
   * the index field in its data.
   *
   * @param {string} key - The Identifier of the new index
   * @returns {BTree}
   */
  createIndex = async (key) => {
    await this.lock.acquireLock(key);

    try {
      const newIndex = new BTree();
      const data = await this.findAll();

      for (const item of data) {
        if (item[key]) newIndex.insert(item[key], item.id);
      }
      this.indexes = { ...this.indexes, [key]: newIndex };

      // return { message: `Index created.`, status: "SUCCESS" };
      return newIndex;
    } catch (error) {
      console.log(error);
    } finally {
      this.lock.releaseLock(key);
    }
  };

  /**
   * Find all data in the database matching a where condition if provided.
   *
   * @param {Object} options An object containing of:
   * - where: can be a key and value object for direct conditioning or
   *          a function to check data.
   * - index: optionally provide a key to use for an index and if one
   *          should be created if it does not exit
   * @returns {Object[]}
   */
  findAll = async ({ where = {}, index = {} } = {}) => {
    // Get the Ids of data stored in the database
    const listOfIds = this.indexes.id.traverseTree();
    const results = [];

    // Return data from cache if it exists
    const cacheKey = `all:${where && JSON.stringify(where)}`;

    if (this.cache.get(cacheKey)) {
      // console.log("Got from Cache");
      return this.cache.get(cacheKey);
    }

    // Use the index to retrieve the data if created or create a
    // new index if specified.
    const indexField = index.key || where.key;
    if (indexField) {
      const indexForUse =
        this.indexes[indexField] ||
        (index.create && (await this.createIndex(indexField)));

      if (where.value && indexForUse) {
        const itemFound = indexForUse.search(where.value);
        if (itemFound) results.push(this.data.get(itemFound.value));
      }
    }

    // If neither the cache nor the index are used iterate through all the
    // items in the data store and return them.
    if (!results.length > 0) {
      for (const id of listOfIds) {
        const data = this.data.get(id);
        if (where && typeof where === "function") {
          if (where(data)) results.push(data);
        } else if (where.key && where.value) {
          if (data[where.key] === where.value) results.push(data);
        } else {
          results.push(data);
        }
      }
    }

    this.cache.set(cacheKey, results);

    return results;
  };

  /**
   * Find all data in the database within a range.
   *
   * @param {Object} options An object containing of
   * - range: which has a key, low, and high used for querying the database
   *          providing data that meet within that range for that key
   * @returns {Object[]}
   */
  findInRange = async ({ range } = {}) => {
    const results = [];
    const { key, low, high } = range;

    const cacheKey = `range:${key + ":" + low + ":" + high}`;
    if (this.cache.get(cacheKey)) {
      // console.log("Got from cache");
      return this.cache.get(cacheKey);
    }

    if (this.indexes[key]) {
      const data = this.indexes[key].findInRange(low, high);
      for (const item of data) {
        results.push(this.data.get(item.value));
      }
    } else {
      const listOfIds = this.indexes.id.traverseTree();

      for (const id of listOfIds) {
        const data = this.data.get(id);
        if (data[key] >= low && data[key] <= high) results.push(data);
      }
    }

    this.cache.set(cacheKey, results);

    return results;
  };
}

module.exports = InMemoryDB;
