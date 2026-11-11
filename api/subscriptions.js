// GET /api/subscriptions -> list subscriptions (max 500; admin use only in practice)
// POST /api/subscriptions { channel: "whatsapp"|"email", contact, name? } -> insert one
//   name is the visitor's name (from the first screen), saved together
//   with the contact so Daniel can later message them by name.
// PATCH /api/subscriptions { _id, name } -> set the name on an existing
//   subscription (used to backfill the ones saved before name was stored).
const { ObjectId } = require("mongodb");
const { getCollection, cors, readJson, cleanStr } = require("./_lib/mongo");

module.exports = async function handler(req, res) {
  if (cors(req, res)) return;
  try {
    const col = await getCollection("subscriptions");
    if (req.method === "GET") {
      const docs = await col.find({}).sort({ createdAt: 1 }).limit(500).toArray();
      return res.status(200).json(docs);
    }
    if (req.method === "POST") {
      const body = await readJson(req);
      const channel = body.channel === "email" ? "email" : body.channel === "whatsapp" ? "whatsapp" : "";
      const contact = cleanStr(body.contact, 120);
      const name = cleanStr(body.name, 80);
      if (!channel || !contact) return res.status(400).json({ error: "channel (whatsapp|email) and contact are required" });
      const doc = { channel, contact, name: name || "", createdAt: new Date().toISOString() };
      const r = await col.insertOne(doc);
      return res.status(201).json({ _id: r.insertedId, ...doc });
    }
    if (req.method === "PATCH") {
      const body = await readJson(req);
      const id = cleanStr(body._id, 40);
      const name = cleanStr(body.name, 80);
      if (!id || !ObjectId.isValid(id)) return res.status(400).json({ error: "valid _id is required" });
      if (!name) return res.status(400).json({ error: "name is required" });
      const r = await col.updateOne({ _id: new ObjectId(id) }, { $set: { name } });
      if (!r.matchedCount) return res.status(404).json({ error: "subscription not found" });
      const doc = await col.findOne({ _id: new ObjectId(id) });
      return res.status(200).json(doc);
    }
    res.setHeader("Allow", "GET, POST, PATCH, OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
};
