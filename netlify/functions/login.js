exports.handler = async (event) => {
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
      body: JSON.stringify({
        ok: false,
        error: "Server sozlanmagan: ADMIN_PASSWORD environment o'zgaruvchisi kiritilmagan.",
      }),
    };
  }

  if (body.password === adminPassword) {
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  }

  return { statusCode: 401, body: JSON.stringify({ ok: false, error: "Parol noto'g'ri" }) };
};
