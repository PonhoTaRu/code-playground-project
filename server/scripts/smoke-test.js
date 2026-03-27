const { spawn } = require("child_process");

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function post(url, body, token = "") {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

async function get(url, token = "") {
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

async function run() {
  const server = spawn("node", ["server.js"], {
    cwd: __dirname + "/..",
    stdio: "pipe",
    env: {
      ...process.env,
      JWT_SECRET: process.env.JWT_SECRET || "smoke_test_secret",
      CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173"
    }
  });

  server.stdout.on("data", (d) => process.stdout.write(d.toString()));
  server.stderr.on("data", (d) => process.stderr.write(d.toString()));

  try {
    await wait(1000);

    const username = `smoke_${Date.now()}`;
    const password = "pass1234";

    const register = await post("http://localhost:8080/register", { username, password });
    if (!register.ok) throw new Error(`register failed: ${register.status}`);

    const login = await post("http://localhost:8080/login", { username, password });
    if (!login.ok || !login.data.token) throw new Error(`login failed: ${login.status}`);
    const token = login.data.token;

    const problems = await get("http://localhost:8080/api/problems?difficulty=easy", token);
    if (!problems.ok || !Array.isArray(problems.data.problems) || problems.data.problems.length === 0) {
      throw new Error(`problems failed: ${problems.status}`);
    }

    const me = await get("http://localhost:8080/api/me", token);
    if (!me.ok || !me.data.username) throw new Error(`me failed: ${me.status}`);

    console.log("SMOKE_TEST_OK");
  } finally {
    server.kill("SIGTERM");
  }
}

run().catch((err) => {
  console.error("SMOKE_TEST_FAIL", err.message);
  process.exit(1);
});
