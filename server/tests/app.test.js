import "./setup.js";
import test, { before, after } from "node:test";
import assert from "node:assert/strict";

const { default: app } = await import("../app.js");
let server, base;

before(async () => {
  await new Promise((resolve) => { server = app.listen(0, resolve); });
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

const post = (path, body, headers = {}) =>
  fetch(base + path, { method: "POST", headers: { "content-type": "application/json", ...headers }, body: typeof body === "string" ? body : JSON.stringify(body) });

test("GET /health is up and carries security headers + request id, no X-Powered-By", async () => {
  const r = await fetch(base + "/health");
  assert.equal(r.status, 200);
  assert.equal((await r.json()).status, "ok");
  assert.equal(r.headers.get("x-powered-by"), null);
  assert.equal(r.headers.get("x-content-type-options"), "nosniff");
  assert.equal(r.headers.get("x-frame-options"), "DENY");
  assert.match(r.headers.get("content-security-policy"), /default-src 'none'/);
  assert.ok(r.headers.get("x-request-id"));
});

test("GET /ready is 503 while the database is not connected", async () => {
  const r = await fetch(base + "/ready");
  assert.equal(r.status, 503);
  assert.equal((await r.json()).database, "disconnected");
});

test("unknown route -> JSON 404", async () => {
  const r = await fetch(base + "/api/v1/nope");
  assert.equal(r.status, 404);
  assert.equal((await r.json()).success, false);
});

test("malformed JSON -> JSON 400 (not an HTML stack trace)", async () => {
  const r = await post("/api/v1/user/login", "{bad json");
  assert.equal(r.status, 400);
  assert.equal((await r.json()).message, "Invalid JSON body");
});

test("NoSQL injection attempt on login is rejected before touching the database", async () => {
  const r = await post("/api/v1/user/login", { email: { $ne: null }, password: { $ne: null } });
  assert.equal(r.status, 400);
});

test("register validation errors", async () => {
  let r = await post("/api/v1/user/register", { name: "Asha", email: "asha@example.com", password: "short" });
  assert.equal(r.status, 400);
  assert.match((await r.json()).message, /Password/);
  r = await post("/api/v1/user/register", { name: "Asha", email: "bad", password: "longenough1" });
  assert.equal(r.status, 400);
});

test("protected routes need a login", async () => {
  for (const path of ["/api/v1/course/", "/api/v1/user/profile", "/api/v1/progress/507f1f77bcf86cd799439011", "/api/v1/purchase/"]) {
    const r = await fetch(base + path);
    assert.equal(r.status, 401, path);
  }
});

test("CSRF origin guard: POST from a foreign origin is refused", async () => {
  const r = await post("/api/v1/user/login", { email: "a@b.co", password: "x" }, { origin: "http://evil.example" });
  assert.equal(r.status, 403);
});

test("CORS: preflight allowed for the frontend, not for strangers", async () => {
  const ok = await fetch(base + "/api/v1/user/login", { method: "OPTIONS", headers: { origin: "http://localhost:5173", "access-control-request-method": "POST" } });
  assert.equal(ok.headers.get("access-control-allow-origin"), "http://localhost:5173");
  assert.equal(ok.headers.get("access-control-allow-credentials"), "true");
  const bad = await fetch(base + "/api/v1/user/login", { method: "OPTIONS", headers: { origin: "http://evil.example", "access-control-request-method": "POST" } });
  assert.equal(bad.headers.get("access-control-allow-origin"), null);
});

test("oversized JSON body -> 413", async () => {
  const r = await post("/api/v1/user/login", { email: "a@b.co", password: "x".repeat(2_000_000) });
  assert.equal(r.status, 413);
});

test("login is rate limited (brute-force protection)", async () => {
  let blocked;
  for (let i = 0; i < 40; i++) {
    const r = await post("/api/v1/user/login", {}); // invalid on purpose: never reaches the database
    if (r.status === 429) { blocked = r; break; }
  }
  assert.ok(blocked, "expected a 429 within 40 attempts");
  assert.ok(Number(blocked.headers.get("retry-after")) >= 1);
});
