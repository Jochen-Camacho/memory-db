# In Memory Database

As the name suggests this is an in memory database which is equipped with a indexes (B-Trees), a cache (Least Recently Used) and a spinnunng lock to handle cncurrency.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)

## Installation 

```
npm install memory-database
```

## Usage

``` javascript
const InMemoryDB = require("memory-database");

const db = new InMemoryDB();

const x = await db.create({ name: "John", age: 19 });
const y = await db.findById(x.id);

console.log(y);

```

## API Reference

### Creating a record

``` javascript
await db.create({ name: "John", age: 19 });
```

### Finding a record by ID

``` javascript
const x = await db.create({ name: "Joe", age: 19 });
await db.findById(x.id);
```

### Deleting a record

``` javascript
await db.deleteById(x.id);

```

### Updating a record

``` javascript
await db.updateById(x.id, { name: "Joseph", age: 23 });

```

### Finding all records

``` javascript
await db.findAll();

```

### Finding records with a condition

``` javascript
await db.findAll({ where: { key: "age", value: 35 } });

// Or

await db.findAll({where: (data) => data.age === 35});
```

### Finding records within a range

``` javascript
await db.findInRange({ range: { key: "age", low: 20, high: 30 } });
```

### Using Indexes

``` javascript
await db.createIndex('age');

await db.findAll({
    where: (data) => data.age === 21,
    index: { key: "age"},
});
```


