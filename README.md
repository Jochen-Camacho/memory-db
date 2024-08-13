# In Memory Database

As the name suggests this is an in memory database which is equipped with indexes (B-Trees), a cache (Least Recently Used) and a spinning lock to handle concurrency.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Areas For Improvement](#areas-for-improvement)

## Installation 

```
npm install memory-database
```

## Usage

To use the database first import the class, then create a db instance. With the instance, you can preform CRUD actions. 
``` javascript
const InMemoryDB = require("memory-database");

const db = new InMemoryDB();

const x = await db.create({ name: "John", age: 19 });
const y = await db.findById(x.id);

console.log(y);

```

## API Reference

### Creating a record
'db.create()' accepts an object value of any kind which it generates a unique id with 'uuid.v4' and returns the object with its id.

``` javascript
await db.create({ name: "John", age: 19 });
```


### Finding a record by ID
'db.findById() accepts the id of a value and first checks if it is available in the cache, then any indexes and finally in the data store hash map. If no value is found, it returns an error message.

``` javascript
const x = await db.create({ name: "Joe", age: 19 });
await db.findById(x.id);
```

### Deleting a record
'db.deleteById()' removes the value from the data store, indexes and if it was present in the cache.

``` javascript
await db.deleteById(x.id);

```

### Updating a record
'db.updateById()' functions similar to deleteById by updating in the data store, indexes and cache. 

``` javascript
await db.updateById(x.id, { name: "Joseph", age: 23 });

```

### Finding all records
'db.findAll()' accepts two object parameters 'where' and 'indexes'. However, with no parameters it simply returns all the data
in the store. 

``` javascript
await db.findAll();

```

### Finding records with a condition
For more specific queries, using the where object offers two forms. Using a key-value pair to locate specific values and a function for a more 
dynamic approach.

``` javascript
await db.findAll({ where: { key: "age", value: 35 } });

// Or

await db.findAll({where: (data) => data.age === 35});
```

### Finding records within a range
'db.findInRange()' accepts a range object consisting of the key that the range should be checked, along with the lower and upper bounds of the range.

``` javascript
await db.findInRange({ range: { key: "age", low: 20, high: 30 } });
```

### Using Indexes
'db.createIndex()' creates an index for the key passed and populates it with the data in the store. We can also pass specific instructions about indexes to the 'db.findAll' such as which key it is checking and if we should create a new index for it if one does not already exist.

``` javascript
await db.createIndex('age');

await db.findAll({
    where: (data) => data.age === 21,
    index: { key: "age", create: true },
});
```

## Areas for Improvement

- Error handling: Provide more specific errors for different failures in any of the CRUD operations.
- Types: Classes or Types for parameters passed as Objects for easier understanding and usage.

