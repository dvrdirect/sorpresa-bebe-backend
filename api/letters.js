// GET /api/letters -> list letters (max 500)
// POST /api/letters { author, message } -> insert one letter
const { getCollection, cors, readJson, cleanStr } = require("./_lib/mongo");

module.exports = async function handler(req, res) {
  if (cors(req, res)) return;
  try {
    const col = await getCollection("letters");
    if (req.method === "GET") {
      const docs = await col.find({}).sort({ createdAt: 1 }).limit(500).toArray();
      return res.status(200).json(docs);
    }
    if (req.method === "POST") {
      const body = await readJson(req);
      const author = cleanStr(body.author, 80);
      const message = cleanStr(body.message, 2000);
      if (!message) return res.status(400).json({ error: "message is required" });
      const doc = { author: author || "Familia", message, createdAt: new Date().toISOString() };
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
