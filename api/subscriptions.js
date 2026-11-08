// GET /api/subscriptions -> list subscriptions (max 500; admin use only in practice)
// POST /api/subscriptions { channel: "whatsapp"|"email", contact } -> insert one
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
      if (!channel || !contact) return res.status(400).json({ error: "channel (whatsapp|email) and contact are required" });
      const doc = { channel, contact, createdAt: new Date().toISOString() };
      const r = await col.insertOne(doc);
      return res.status(201).json({ _id: r.insertedId, ...doc });
    }
    res.setHeader("Allow", "GET, POST, OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
};
