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

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function nextPow2(n) {
  let p = 1;
  while (p < n) p *= 2;
  return Math.max(p, 2);
}

function generateBracket(teams) {
  const shuffled = shuffle(teams);
  const size = nextPow2(shuffled.length);
  const slots = new Array(size).fill(null);
  shuffled.forEach((t, i) => (slots[i] = t.id));

  const round0 = [];
  for (let i = 0; i < size / 2; i++) {
    const a = slots[2 * i];
    const b = slots[2 * i + 1];
    let winner = null;
    if (a && !b) winner = a;
    if (b && !a) winner = b;
    round0.push({ a, b, winner });
  }

  const totalRounds = Math.log2(size);
  const rounds = [round0];
  for (let r = 1; r < totalRounds; r++) {
    const prev = rounds[r - 1];
    const matches = [];
    for (let i = 0; i < prev.length / 2; i++) {
      const m1 = prev[2 * i];
      const m2 = prev[2 * i + 1];
      const a = m1.winner || null;
      const b = m2.winner || null;
      let winner = null;
      if (a && !b) winner = a;
      if (b && !a) winner = b;
      matches.push({ a, b, winner });
    }
    rounds.push(matches);
  }

  return { teams, rounds };
}

function cascade(rounds, r, i) {
  if (r + 1 >= rounds.length) return;
  const mi = Math.floor(i / 2);
  const slot = i % 2 === 0 ? "a" : "b";
  const next = rounds[r + 1][mi];
  const winnerVal = rounds[r][i].winner || null;
  if (next[slot] !== winnerVal) {
    next[slot] = winnerVal;
    next.winner = null;
    cascade(rounds, r + 1, mi);
  }
}

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
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: "Server sozlanmagan: ADMIN_PASSWORD kiritilmagan." }) };
  }
  if (body.password !== adminPassword) {
    return { statusCode: 401, body: JSON.stringify({ ok: false, error: "Ruxsat yo'q" }) };
  }

  const sport = body.sport;
  if (!SPORTS.includes(sport)) {
    return { statusCode: 400, body: JSON.stringify({ ok: false, error: "Noma'lum sport turi" }) };
  }

  let store;
  try {
    store = openStore();
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: false, error: "Blobs bazasiga ulanib bo'lmadi", detail: String(err && err.message ? err.message : err) }),
    };
  }

  try {
    if (body.action === "draw") {
      const teams = Array.isArray(body.teams) ? body.teams.filter((t) => t && t.id) : [];
      if (teams.length < 2) {
        return { statusCode: 400, body: JSON.stringify({ ok: false, error: "Kamida 2 ta jamoa kerak" }) };
      }
      const cleanTeams = teams.map((t) => ({ id: String(t.id), name: String(t.name || t.id).slice(0, 80) }));
      const bracket = generateBracket(cleanTeams);
      await store.setJSON("bracket-" + sport, bracket);
      return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ok: true, data: bracket }) };
    }

    if (body.action === "setWinner") {
      const bracket = await store.get("bracket-" + sport, { type: "json" });
      if (!bracket) {
        return { statusCode: 400, body: JSON.stringify({ ok: false, error: "Bu sport uchun setka hali yaratilmagan" }) };
      }
      const r = Number(body.round);
      const i = Number(body.match);
      const teamId = String(body.teamId);
      if (!bracket.rounds[r] || !bracket.rounds[r][i]) {
        return { statusCode: 400, body: JSON.stringify({ ok: false, error: "Noto'g'ri o'yin manzili" }) };
      }
      const m = bracket.rounds[r][i];
      if (m.a !== teamId && m.b !== teamId) {
        return { statusCode: 400, body: JSON.stringify({ ok: false, error: "Bu jamoa shu o'yinda ishtirok etmaydi" }) };
      }
      m.winner = teamId;
      cascade(bracket.rounds, r, i);
      await store.setJSON("bracket-" + sport, bracket);
      return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ok: true, data: bracket }) };
    }

    if (body.action === "reset") {
      await store.delete("bracket-" + sport);
      return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ok: true, data: null }) };
    }

    return { statusCode: 400, body: JSON.stringify({ ok: false, error: "Noma'lum amal" }) };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: false, error: "Saqlashda xatolik", detail: String(err && err.message ? err.message : err) }),
    };
  }
};
