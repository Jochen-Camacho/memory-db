const InMemoryDB = require("../src/db/InMemoryDB");

const db = new InMemoryDB();

const testCreate = async () => {
  console.log("Testing create:");

  const x = await db.create({ name: "John", age: 19 });
  console.log(x);
};

const testFindById = async () => {
  console.log("Testing findById:");

  const x = await db.create({ name: "Joe", age: 19 });
  const y = await db.findById(x.id);
  console.log(y);
};

const testDeleteById = async () => {
  console.log("Testing deleteById:");

  const x = await db.create({ name: "Harry", age: 18 });
  const y = await db.deleteById(x.id);
  console.log(y);
  console.log(await db.findById(x.id));
};

const testUpdateById = async () => {
  console.log("Testing updateById:");

  const x = await db.create({ name: "Cane", age: 28 });
  console.log(x);
  await db.updateById(x.id, { name: "Joseph", age: 23 });
  const y = await db.findById(x.id);
  console.log(y);
};

const testFindAll = async () => {
  console.log("Testing findAll:");
  await db.create({ name: "Chris", age: 21 });
  await db.create({ name: "Dane", age: 19 });
  await db.create({ name: "Rody", age: 31 });
  await db.create({ name: "Sarah", age: 35 });
  const x = await db.findAll();
  console.log(x);

  const y = await db.findAll({ where: { key: "age", value: 35 } });
  console.log(y);

  const z = await db.findAll({
    where: (data) => data.age === 21,
    index: { key: "age", create: true },
  });
  console.log(z);
};

const testFindInRange = async () => {
  console.log("Testing findInRange:");
  const x = await db.findInRange({ range: { key: "age", low: 20, high: 30 } });
  console.log(x);
};

const test = async () => {
  await testCreate();
  await testFindById();
  await testDeleteById();
  await testUpdateById();
  await testFindAll();
  await testFindInRange();
};

test();
