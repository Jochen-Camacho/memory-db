const LRUCache = require("./LRUCache");
const BTree = require("./BTree");
const uuid = require("uuid");

class InMemoryDB {
  constructor() {
    this.data = new Map();
    this.cache = new LRUCache();
    this.indexes = { id: new BTree() };
  }

  create = (value) => {
    const id = uuid.v4();
    // const id = Date.now();
    this.data.set(id, value);
    this.cache.set(id, value);
    this.indexes.id.insert(id, id);

    return { id, ...value };
  };

  findById = (key) => {
    if (this.cache.get(key)) {
      console.log("Found in Cache");
      return { id: key, ...this.cache.get(key) };
    }

    const keyFromIndex = this.indexes.id.search(key);
    if (keyFromIndex) {
      console.log("Found in ID Index");
      return { id: key, ...this.data.get(this.indexes.id.search(key)) };
    }

    if (this.data.has(key)) {
      return { id: key, ...this.data.get(key) };
    }

    return { error: `No Data Found for ID: ${key}`, status: "FAILED" };
  };

  createIndex = (key) => {
    this.indexes = { ...this.indexes, [key]: new BTree() };

    return { message: `Index created.`, status: "SUCCESS" };
  };

  deleteById = (key) => {
    if (this.data.has(key)) {
      this.data.delete(key);
    } else {
      return { error: `No Data Found for ID: ${key}`, status: "FAILED" };
    }

    if (this.cache.get(key)) {
      console.log("Deleting From Cache");
      this.cache.delete(key);
    }

    const keyFromIndex = this.indexes.id.search(key);
    if (keyFromIndex) {
      console.log("Deleting from ID Index");
      this.indexes.id.delete(keyFromIndex.key);
      // console.log(this.indexes.id);
    }

    return { message: `Data deleted for ${key}`, status: "SUCCESS" };
  };

  findAll = ({ where } = {}) => {
    const listOfIds = this.indexes.id.traverseTree();

    const results = [];

    const cacheKey = `all:${where && where.key + ":" + where.value}`;
    if (this.cache.get(cacheKey)) return this.cache.get(cacheKey);

    for (const id of listOfIds) {
      const data = this.data.get(id);
      if (where) {
        if (data[where.key] === where.value) results.push(data);
      } else {
        results.push(data);
      }
    }

    this.cache.set(cacheKey, results);

    return results;
  };

  findInRange = ({ range } = {}) => {
    const results = [];
    const { key, low, high } = range;

    const cacheKey = `range:${key + ":" + low + ":" + high}`;
    if (this.cache.get(cacheKey)) return this.cache.get(cacheKey);

    if (this.indexes[key]) console.log(this.indexes[range.key]);
    else {
      const listOfIds = this.indexes.id.traverseTree();

      for (const id of listOfIds) {
        const data = this.data.get(id);
        if (data[key] >= low && data[key] <= high) results.push(data);
      }
    }

    this.cache.set(cacheKey, results);

    return results;
  };
  updateById = (key, value) => {
    if (this.data.has(key)) {
      this.data.set(key, value);
    } else {
      return { error: `No Data Found for ID: ${key}`, status: "FAILED" };
    }

    if (this.cache.get(key)) {
      this.cache.set(key, value);
    }

    const keyFromIndex = this.indexes.id.search(key);
    if (keyFromIndex) {
      this.indexes.id.delete(keyFromIndex.key);
      this.indexes.id.insert(keyFromIndex.key, value);
    }

    return { message: `Data updated for ${key}`, status: "SUCCESS" };
  };
}

const db = new InMemoryDB();
// db.createIndex("age");
const var1 = db.create({ name: "John", age: 15 });
const var2 = db.create({ name: "Johnny", age: 20 });
const var3 = db.create({ name: "David", age: 22 });
// console.log("Var 1");
// console.log(var1);

// console.log("From findById:");
// console.log(db.findById(var2.id));

// console.log(db.findAll());
// db.updateById(var1.id, { name: "Joe Kent", age: 20 });
// console.log(db.findAll({ where: { key: "age", value: 20 } }));

console.log(db.findInRange({ range: { key: "age", low: 15, high: 21 } }));

// const var3 = db.create({ name: "Joe", age: 23 });

// console.log(new Date());
// for (let i = 0; i < 100000; i++) db.create(uuid.v4());
// console.log(new Date());

// console.log(db.findAll());
// console.log(new Date());
// console.log(db.findAll());
// console.log(new Date());

// console.log(db);
