// Shared MongoDB helper for Vercel serverless functions.
// The connection string comes ONLY from the MONGODB_URI env var set in
// Vercel (never hardcoded, never committed):
//   mongodb+srv://dvrdirect_db_user:<password>@cluster0.<host>/sorpresa_bebe
// Cached client survives warm invocations; cold starts reconnect.
const { MongoClient } = require("mongodb");

let clientPromise = null;

function getClient() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI env var is not set");
  if (!clientPromise) {
    const client = new MongoClient(uri);
    clientPromise = client.connect().catch((e) => { clientPromise = null; throw e; });
  }
  return clientPromise;
}

async function getCollection(name) {
  const client = await getClient();
  return client.db("sorpresa_bebe").collection(name);
}

const ALLOWED_ORIGIN = "https://dvrdirect.github.io";

function cors(req, res) {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(204).end(); return true; }
  return false;
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (c) => { body += c; if (body.length > 100000) req.destroy(); });
    req.on("end", () => {
      if (!body) return resolve({});
      try { resolve(JSON.parse(body)); } catch (e) { reject(new Error("Invalid JSON")); }
    });
    req.on("error", reject);
  });
}

function cleanStr(v, max) {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

module.exports = { getCollection, cors, readJson, cleanStr };
