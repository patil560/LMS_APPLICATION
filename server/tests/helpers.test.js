import "./setup.js";
import test from "node:test";
import assert from "node:assert/strict";
import { parsePagination, buildPageMeta } from "../utils/pagination.js";
import { stripMongoOperators, sanitizeBody, originGuard, securityHeaders } from "../middleware/security.js";
import { validateRegister, validateLogin, validateObjectIdParam } from "../middleware/validate.js";

const res = () => {
  const r = { code: 200, headers: {} };
  r.status = (c) => { r.code = c; return r; };
  r.json = (b) => { r.body = b; return r; };
  r.setHeader = (k, v) => { r.headers[k] = v; };
  return r;
};

test("pagination: defaults, caps and garbage input", () => {
  assert.deepEqual(parsePagination({}), { page: 1, limit: 12, skip: 0 });
  assert.deepEqual(parsePagination({ page: "3", limit: "10" }), { page: 3, limit: 10, skip: 20 });
  assert.equal(parsePagination({ limit: "100000" }).limit, 50); // hard cap
  assert.equal(parsePagination({ page: "-5", limit: "0" }).page, 1);
  assert.equal(parsePagination({ page: "abc", limit: "xyz" }).limit, 12);
});

test("pagination meta", () => {
  const m = buildPageMeta({ page: 2, limit: 10, total: 25 });
  assert.equal(m.totalPages, 3);
  assert.equal(m.hasNextPage, true);
  assert.equal(m.hasPrevPage, true);
  assert.equal(buildPageMeta({ page: 1, limit: 10, total: 0 }).totalPages, 1);
});

test("NoSQL injection: operator keys are removed from the body", () => {
  const body = { email: { $ne: null }, password: "x", nested: { "$where": "1", ok: 1, "a.b": 2 }, list: [{ $gt: 1, fine: 2 }] };
  stripMongoOperators(body);
  assert.deepEqual(body, { email: {}, password: "x", nested: { ok: 1 }, list: [{ fine: 2 }] });
  const req = { body: { a: { $ne: 1 } } };
  sanitizeBody(req, res(), () => {});
  assert.deepEqual(req.body, { a: {} });
});

test("origin guard blocks POST from unknown origins, allows known and missing origins", () => {
  let called = 0; const next = () => { called++; };
  const bad = res(); originGuard({ method: "POST", headers: { origin: "http://evil.com" } }, bad, next);
  assert.equal(bad.code, 403); assert.equal(called, 0);
  originGuard({ method: "POST", headers: { origin: "http://localhost:5173" } }, res(), next);
  originGuard({ method: "POST", headers: {} }, res(), next); // e.g. Stripe webhook
  originGuard({ method: "GET", headers: { origin: "http://evil.com" } }, res(), next);
  assert.equal(called, 3);
});

test("security headers are set", () => {
  const r = res(); securityHeaders({}, r, () => {});
  assert.equal(r.headers["X-Content-Type-Options"], "nosniff");
  assert.equal(r.headers["X-Frame-Options"], "DENY");
  assert.match(r.headers["Content-Security-Policy"], /default-src 'none'/);
});

test("register validation", () => {
  const run = (body) => { const r = res(); let ok = false; validateRegister({ body }, r, () => { ok = true; }); return { r, ok }; };
  assert.equal(run({ name: "Asha", email: "asha@example.com", password: "longenough1" }).ok, true);
  assert.equal(run({ name: "A", email: "asha@example.com", password: "longenough1" }).r.code, 400);
  assert.equal(run({ name: "Asha", email: "not-an-email", password: "longenough1" }).r.code, 400);
  assert.equal(run({ name: "Asha", email: "asha@example.com", password: "short" }).r.code, 400);
  assert.equal(run({ name: "Asha", email: { $ne: 1 }, password: "longenough1" }).r.code, 400);
  assert.equal(run({ name: "Asha", email: "asha@example.com", password: "x".repeat(100) }).r.code, 400); // bcrypt 72-byte limit
});

test("login validation only accepts strings", () => {
  const run = (body) => { const r = res(); let ok = false; validateLogin({ body }, r, () => { ok = true; }); return { r, ok }; };
  assert.equal(run({ email: "a@b.co", password: "x" }).ok, true);
  assert.equal(run({ email: { $ne: null }, password: "x" }).r.code, 400);
  assert.equal(run({ email: "a@b.co", password: ["x"] }).r.code, 400);
  assert.equal(run({}).r.code, 400);
});

test("ObjectId param validation", () => {
  const run = (v) => { const r = res(); let ok = false; validateObjectIdParam({}, r, () => { ok = true; }, v); return { r, ok }; };
  assert.equal(run("507f1f77bcf86cd799439011").ok, true);
  assert.equal(run("not-an-id").r.code, 400);
  assert.equal(run("123").r.code, 400);
});
