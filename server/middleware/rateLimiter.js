import { env } from "../config/env.js";

// Small dependency-free fixed-window rate limiter (in memory, per process).
// Behind several workers/servers every process keeps its own counters; use a shared
// store such as Redis (or limit at nginx / Cloudflare) when you need one global limit.
export const createRateLimiter = ({
  windowMs = 15 * 60 * 1000,
  max = 100,
  message = "Too many requests, please try again later.",
  keyGenerator = (req) => req.ip,
  skip = () => false,
  maxKeys = 100_000, // memory cap so an attacker cannot fill RAM with fake keys
} = {}) => {
  const hits = new Map(); // key -> { count, resetAt }

  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key);
    }
  }, Math.min(windowMs, 60_000));
  cleanup.unref(); // never keeps the process alive

  const limiter = (req, res, next) => {
    if (env.rateLimitDisabled || skip(req)) return next();

    const now = Date.now();
    const key = String(keyGenerator(req) ?? "unknown");

    let entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      if (!entry && hits.size >= maxKeys) hits.delete(hits.keys().next().value); // evict oldest
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }
    entry.count += 1;

    const secondsLeft = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    res.setHeader("RateLimit-Limit", max);
    res.setHeader("RateLimit-Remaining", Math.max(0, max - entry.count));
    res.setHeader("RateLimit-Reset", secondsLeft);

    if (entry.count > max) {
      res.setHeader("Retry-After", secondsLeft);
      return res.status(429).json({ success: false, message });
    }
    next();
  };

  limiter.reset = () => hits.clear();
  limiter.size = () => hits.size;
  return limiter;
};

const WEBHOOK_PATH = "/api/v1/purchase/webhook";
const userOrIp = (req) => req.id || req.ip; // req.id = logged-in user id (set by isAuthenticated)

// General safety net for every API call (Stripe's webhook is excluded so events are never dropped).
export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 600,
  skip: (req) => req.originalUrl.startsWith(WEBHOOK_PATH),
});

// Login / register: slows down password guessing and fake-account spam.
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "Too many login attempts. Please try again in a few minutes.",
});

// Per-account limit so a botnet cannot brute-force one email from many IPs.
export const loginAccountLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => `acct:${String(req.body?.email ?? "").toLowerCase().trim()}`,
  message: "Too many attempts for this account. Please try again in a few minutes.",
});

// Uploads are expensive (CPU, disk, Cloudinary bill).
export const uploadLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 60,
  keyGenerator: userOrIp,
  message: "Upload limit reached. Please try again later.",
});

// Creating Stripe checkout sessions.
export const checkoutLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyGenerator: userOrIp,
  message: "Too many checkout attempts. Please try again later.",
});
