// Express server for Render (free web service).
// Same API as the Vercel serverless functions in api/ — same routes,
// same validation, same MongoDB Atlas database (sorpresa_bebe).
// The connection string comes ONLY from the MONGODB_URI env var set in
// Render (never hardcoded, never committed):
//   mongodb+srv://dvrdirect_db_user:<password>@cluster0.msv7q39.mongodb.net/sorpresa_bebe
// Reuses getCollection() / cleanStr() from api/_lib/mongo.js.
const express = require("express");
const { ObjectId } = require("mongodb");
const { getCollection, cleanStr } = require("./api/_lib/mongo");

const app = express();
const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGIN = "https://dvrdirect.github.io";

app.use(express.json({ limit: "100kb" }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  next();
});

app.get("/health", (req, res) => res.json({ ok: true }));

// GET /api/votes -> list votes (newest last, max 500)
// POST /api/votes { name, sex: "nino"|"nina", voter? } -> insert one vote
app.get("/api/votes", async (req, res) => {
  try {
    const col = await getCollection("votes");
    const docs = await col.find({}).sort({ createdAt: 1 }).limit(500).toArray();
    res.json(docs);
  } catch (e) { console.error(e); res.status(500).json({ error: "Server error" }); }
});
app.post("/api/votes", async (req, res) => {
  try {
    const name = cleanStr(req.body && req.body.name, 80);
    const sex = req.body && (req.body.sex === "nino" || req.body.sex === "nina") ? req.body.sex : "";
    const voter = cleanStr(req.body && req.body.voter, 80);
    if (!name || !sex) return res.status(400).json({ error: "name and sex (nino|nina) are required" });
    const doc = { name, sex, voter: voter || "Familia", createdAt: new Date().toISOString() };
    const r = await (await getCollection("votes")).insertOne(doc);
    res.status(201).json({ _id: r.insertedId, ...doc });
  } catch (e) { console.error(e); res.status(500).json({ error: "Server error" }); }
});

// GET /api/letters -> list letters (max 500)
// POST /api/letters { author?, message } -> insert one letter
app.get("/api/letters", async (req, res) => {
  try {
    const col = await getCollection("letters");
    const docs = await col.find({}).sort({ createdAt: 1 }).limit(500).toArray();
    res.json(docs);
  } catch (e) { console.error(e); res.status(500).json({ error: "Server error" }); }
});
app.post("/api/letters", async (req, res) => {
  try {
    const author = cleanStr(req.body && req.body.author, 80);
    const message = cleanStr(req.body && req.body.message, 2000);
    if (!message) return res.status(400).json({ error: "message is required" });
    const doc = { author: author || "Familia", message, createdAt: new Date().toISOString() };
    const r = await (await getCollection("letters")).insertOne(doc);
    res.status(201).json({ _id: r.insertedId, ...doc });
  } catch (e) { console.error(e); res.status(500).json({ error: "Server error" }); }
});

// GET /api/subscriptions -> list subscriptions (max 500)
// POST /api/subscriptions { channel: "whatsapp"|"email", contact, name? } -> insert one
//   name is the visitor's name (from the first screen), saved together
//   with the contact so Daniel can later message them by name.
// PATCH /api/subscriptions/:id { name } -> set the name on an existing
//   subscription (used to backfill the ones saved before name was stored).
app.get("/api/subscriptions", async (req, res) => {
  try {
    const col = await getCollection("subscriptions");
    const docs = await col.find({}).sort({ createdAt: 1 }).limit(500).toArray();
    res.json(docs);
  } catch (e) { console.error(e); res.status(500).json({ error: "Server error" }); }
});
app.post("/api/subscriptions", async (req, res) => {
  try {
    const channel = req.body && req.body.channel === "email" ? "email"
      : req.body && req.body.channel === "whatsapp" ? "whatsapp" : "";
    const contact = cleanStr(req.body && req.body.contact, 120);
    const name = cleanStr(req.body && req.body.name, 80);
    if (!channel || !contact) return res.status(400).json({ error: "channel (whatsapp|email) and contact are required" });
    const doc = { channel, contact, name: name || "", createdAt: new Date().toISOString() };
    const r = await (await getCollection("subscriptions")).insertOne(doc);
    res.status(201).json({ _id: r.insertedId, ...doc });
  } catch (e) { console.error(e); res.status(500).json({ error: "Server error" }); }
});
app.patch("/api/subscriptions/:id", async (req, res) => {
  try {
    const id = req.params && req.params.id;
    if (!id || !ObjectId.isValid(id)) return res.status(400).json({ error: "valid id is required" });
    const name = cleanStr(req.body && req.body.name, 80);
    if (!name) return res.status(400).json({ error: "name is required" });
    const col = await getCollection("subscriptions");
    const r = await col.updateOne({ _id: new ObjectId(id) }, { $set: { name } });
    if (!r.matchedCount) return res.status(404).json({ error: "subscription not found" });
    const doc = await col.findOne({ _id: new ObjectId(id) });
    res.json(doc);
  } catch (e) { console.error(e); res.status(500).json({ error: "Server error" }); }
});

app.listen(PORT, () => console.log("sorpresa-bebe-backend listening on port " + PORT));
