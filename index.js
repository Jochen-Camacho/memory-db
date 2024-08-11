const express = require("express");
const app = express();
const LRUCache = require("./LRUCache");

app.use(express.json());

const store = new LRUCache(10);

setInterval(() => {
  const expiredObjects = [...store.hashMap.entries()].filter((obj) => {
    return obj[1].value.createdAt + obj[1].value.timeToLive < Date.now();
  });
  for (const obj of expiredObjects) {
    store.delete(obj[0]);
    console.log(`Deleted ${obj[0]} Due to expiration.`);
  }
}, [1000]);

app.get("/store", (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 20;

  const startIdx = (page - 1) * limit;
  const endIdx = startIdx + limit;
  console.log(startIdx, endIdx);

  const data = [...store.hashMap.entries()].slice(startIdx, endIdx);

  const formatedData = [];

  for (const obj of data) {
    console.log(obj);
    formatedData.push({
      key: obj[0],
      value: obj[1].value.value,
      createdAt: new Date(obj[1].value.createdAt),
      timeToLive: obj[1].value.timeToLive / 1000,
    });
  }

  return res.json({
    formatedData,
    pagination: {
      page,
      limit,
    },
    error: null,
  });
});

app.get("/store/:key", (req, res) => {
  const key = req.params.key;
  const value = store.get(key);

  if (!value)
    return res.status(404).json({ value: null, error: "Key not found" });

  return res.json({ value, error: null });
});

app.post("/store", (req, res) => {
  const { key, value } = req.body;
  const timeToLive = req.body.timeToLive * 1000;

  if (!(key && value))
    return res.status(400).json({ error: "Key or Value missing" });

  store.set(key, {
    value,
    createdAt: Date.now(),
    timeToLive: timeToLive || 10000,
  });
  console.log(store);
  return res.json(store.get(req.body.key));
});

app.delete("/store", (req, res) => {
  const { key } = req.body;

  if (!key) return res.status(404).json({ error: "Key missing" });

  store.delete(key);
  console.log(store);
  return res.sendStatus(204);
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Running on http://localhost:${PORT}`);
});
