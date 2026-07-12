const { connectLambda, getStore } = require("@netlify/blobs");

const FIELDS = ["site", "tez", "kahoot1", "ai", "cs", "pubg", "futbol", "shashka", "mantiq", "matkahoot"];
const MAX = { site: 20, tez: 10, kahoot1: 10, ai: 10, cs: 5, pubg: 5, futbol: 5, shashka: 5, mantiq: 15, matkahoot: 15 };

exports.handler = async (event) => {
  connectLambda(event);

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ ok: false, error: "Noto'g'ri so'rov" }) };
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: "Server sozlanmagan: ADMIN_PASSWORD kiritilmagan." }),
    };
  }
  if (body.password !== adminPassword) {
    return { statusCode: 401, body: JSON.stringify({ ok: false, error: "Ruxsat yo'q" }) };
  }

  const incoming = body.data;
  if (!incoming || !Array.isArray(incoming.teams) || typeof incoming.scores !== "object") {
    return { statusCode: 400, body: JSON.stringify({ ok: false, error: "Ma'lumot noto'g'ri formatda" }) };
  }

  // Sanitize: clamp every score field to its allowed range, keep team list well-formed.
  const cleanTeams = incoming.teams
    .filter((t) => t && typeof t.id === "string")
    .map((t) => ({ id: t.id, name: String(t.name || t.id).slice(0, 80) }));

  const cleanScores = {};
  cleanTeams.forEach((t) => {
    const src = incoming.scores[t.id] || {};
    const s = {};
    FIELDS.forEach((f) => {
      let v = Number(src[f]) || 0;
      v = Math.max(0, Math.min(MAX[f], v));
      s[f] = v;
    });
    cleanScores[t.id] = s;
  });

  const cleanData = { teams: cleanTeams, scores: cleanScores };

  try {
    const store = getStore({ name: "turnir", consistency: "strong" });
    await store.setJSON("data", cleanData);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true, data: cleanData }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: "Saqlashda xatolik", detail: String(err) }),
    };
  }
};
