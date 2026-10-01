// Loads .env and validates configuration ONCE, before anything else runs.
// Import this file first (app.js does) so every module sees the same, checked settings.
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const nodeEnv = process.env.NODE_ENV || "development";
const isProd = nodeEnv === "production";
const isTest = nodeEnv === "test";

// ---- required everywhere -------------------------------------------------
const required = ["MONGO_URI", "JWT_SECRET", "STRIPE_SECRET_KEY"];
// ---- required only in production (warned about in development) -----------
const requiredInProd = [
  "FRONTEND_URL",
  "WEBHOOK_ENDPOINT_SECRET",
  "CLOUD_NAME",
  "API_KEY",
  "API_SECRET",
];

const missing = required.filter((key) => !process.env[key]);
const missingProd = requiredInProd.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`[config] Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

if (isProd) {
  if (missingProd.length > 0) {
    console.error(`[config] Missing production environment variables: ${missingProd.join(", ")}`);
    process.exit(1);
  }
  if (process.env.JWT_SECRET.length < 32) {
    console.error("[config] JWT_SECRET must be at least 32 characters in production.");
    process.exit(1);
  }
} else if (missingProd.length > 0 && !isTest) {
  console.warn(`[config] Warning - not set (needed in production): ${missingProd.join(", ")}`);
}

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

// TRUST_PROXY: set to the number of proxies in front of the app (e.g. 1 for nginx/Render/Heroku).
// Without it, every user behind a proxy shares one IP and would share one rate-limit bucket.
const trustProxyRaw = process.env.TRUST_PROXY;
let trustProxy = false;
if (trustProxyRaw) {
  trustProxy = /^\d+$/.test(trustProxyRaw) ? Number(trustProxyRaw) : trustProxyRaw === "true" ? true : trustProxyRaw;
}

export const env = {
  nodeEnv,
  isProd,
  isTest,
  port: Number(process.env.PORT) || 8080,
  // FRONTEND_URL can hold several origins separated by commas
  frontendUrl: frontendUrl.split(",")[0].trim().replace(/\/$/, ""),
  allowedOrigins: frontendUrl.split(",").map((o) => o.trim().replace(/\/$/, "")).filter(Boolean),
  trustProxy,
  // Cookie settings: use COOKIE_SAMESITE=none (needs HTTPS) when frontend and API are on different sites.
  cookieSecure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === "true" : isProd,
  cookieSameSite: process.env.COOKIE_SAMESITE || "lax",
  rateLimitDisabled: process.env.RATE_LIMIT_DISABLED === "true",
  mongoMaxPool: Number(process.env.MONGO_MAX_POOL) || 50,
};
