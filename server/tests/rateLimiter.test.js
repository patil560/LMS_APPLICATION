import "./setup.js";
import test from "node:test";
import assert from "node:assert/strict";
import { createRateLimiter } from "../middleware/rateLimiter.js";

const fakeRes = () => {
  const res = { headers: {}, statusCode: 200 };
  res.setHeader = (k, v) => { res.headers[k] = v; };
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  return res;
};
const hit = (limiter, ip = "1.1.1.1") => {
  const res = fakeRes(); let passed = false;
  limiter({ ip, originalUrl: "/api/x", body: {} }, res, () => { passed = true; });
  return { res, passed };
};

test("allows up to max requests, then answers 429 with Retry-After", () => {
  const limiter = createRateLimiter({ windowMs: 60_000, max: 3 });
  for (let i = 0; i < 3; i++) assert.equal(hit(limiter).passed, true);
  const blocked = hit(limiter);
  assert.equal(blocked.passed, false);
  assert.equal(blocked.res.statusCode, 429);
  assert.ok(Number(blocked.res.headers["Retry-After"]) >= 1);
  assert.equal(blocked.res.body.success, false);
});

test("sets RateLimit headers and counts down", () => {
  const limiter = createRateLimiter({ windowMs: 60_000, max: 5 });
  const first = hit(limiter).res.headers;
  assert.equal(first["RateLimit-Limit"], 5);
  assert.equal(first["RateLimit-Remaining"], 4);
});

test("different clients have separate counters", () => {
  const limiter = createRateLimiter({ windowMs: 60_000, max: 1 });
  assert.equal(hit(limiter, "a").passed, true);
  assert.equal(hit(limiter, "b").passed, true);
  assert.equal(hit(limiter, "a").passed, false);
});

test("counter resets after the window", async () => {
  const limiter = createRateLimiter({ windowMs: 80, max: 1 });
  assert.equal(hit(limiter).passed, true);
  assert.equal(hit(limiter).passed, false);
  await new Promise((r) => setTimeout(r, 120));
  assert.equal(hit(limiter).passed, true);
});

test("skip() bypasses the limiter (used for the Stripe webhook)", () => {
  const limiter = createRateLimiter({ windowMs: 60_000, max: 1, skip: () => true });
  for (let i = 0; i < 5; i++) assert.equal(hit(limiter).passed, true);
});

test("memory is capped by maxKeys", () => {
  const limiter = createRateLimiter({ windowMs: 60_000, max: 5, maxKeys: 10 });
  for (let i = 0; i < 100; i++) hit(limiter, `ip-${i}`);
  assert.ok(limiter.size() <= 10);
});
