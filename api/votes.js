// GET /api/votes -> list votes (newest last, max 500)
// POST /api/votes { name, sex: "nino"|"nina", voter? } -> insert one vote
const { getCollection, cors, readJson, cleanStr } = require("./_lib/mongo");

module.exports = async function handler(req, res) {
  if (cors(req, res)) return;
  try {
    const col = await getCollection("votes");
    if (req.method === "GET") {
      const docs = await col.find({}).sort({ createdAt: 1 }).limit(500).toArray();
      return res.status(200).json(docs);
    }
    if (req.method === "POST") {
      const body = await readJson(req);
      const name = cleanStr(body.name, 80);
      const sex = body.sex === "nino" || body.sex === "nina" ? body.sex : "";
      const voter = cleanStr(body.voter, 80);
      if (!name || !sex) return res.status(400).json({ error: "name and sex (nino|nina) are required" });
      const doc = { name, sex, voter: voter || "Familia", createdAt: new Date().toISOString() };
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
