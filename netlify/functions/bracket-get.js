const { connectLambda, getStore } = require("@netlify/blobs");

function openStore() {
  const siteID = process.env.SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN;
  if (siteID && token) {
    return getStore({ name: "turnir", siteID, token, consistency: "strong" });
  }
  return getStore({ name: "turnir", consistency: "strong" });
}

const SPORTS = ["futbol", "cs", "pubg", "shashka"];

exports.handler = async (event) => {
  connectLambda(event);

  let store;
  try {
    store = openStore();
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Blobs bazasiga ulanib bo'lmadi", detail: String(err && err.message ? err.message : err) }),
    };
  }

  try {
    const result = {};
    for (const sport of SPORTS) {
      const data = await store.get("bracket-" + sport, { type: "json" });
      result[sport] = data || null;
    }
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: JSON.stringify(result),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Setkalarni o'qishda xatolik", detail: String(err && err.message ? err.message : err) }),
    };
  }
};
