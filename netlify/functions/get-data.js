const { connectLambda, getStore } = require("@netlify/blobs");

const FIELDS = ["site", "tez", "kahoot1", "ai", "cs", "pubg", "futbol", "shashka", "mantiq", "matkahoot"];

function emptyScores() {
  const s = {};
  FIELDS.forEach((f) => (s[f] = 0));
  return s;
}

function defaultData() {
  const teams = [];
  const scores = {};
  for (let i = 1; i <= 50; i++) {
    const id = "t" + i;
    teams.push({ id, name: i + "-guruh" });
    scores[id] = emptyScores();
  }
  return { teams, scores };
}

exports.handler = async (event) => {
  connectLambda(event);
  const store = getStore({ name: "turnir", consistency: "strong" });

  try {
    let data = await store.get("data", { type: "json" });
    if (!data) {
      data = defaultData();
      await store.setJSON("data", data);
    }
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Ma'lumotlarni o'qishda xatolik", detail: String(err) }),
    };
  }
};
