import { env } from "../config/env.js";

// Security headers (the most useful subset of what the `helmet` package sets).
// This API only returns JSON, so a very strict Content-Security-Policy is safe.
export const securityHeaders = (req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff"); // stop MIME sniffing
  res.setHeader("X-Frame-Options", "DENY"); // clickjacking
  res.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-DNS-Prefetch-Control", "off");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin"); // the SPA lives on another origin
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (env.isProd) {
    res.setHeader("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
  }
  next();
};

// NoSQL-injection guard: removes keys such as {"$ne": null} or "a.b" from the JSON body,
// so a login like {"email": {"$ne": null}} can never reach MongoDB as an operator.
export const stripMongoOperators = (value, depth = 0) => {
  if (depth > 10 || value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) {
    value.forEach((item) => stripMongoOperators(item, depth + 1));
    return value;
  }
  for (const key of Object.keys(value)) {
    if (key.startsWith("$") || key.includes(".")) {
      delete value[key];
    } else {
      stripMongoOperators(value[key], depth + 1);
    }
  }
  return value;
};

export const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === "object") stripMongoOperators(req.body);
  next();
};

// Cache headers for public, read-only lists: browsers always revalidate (ETag -> cheap 304),
// while a CDN / reverse proxy may serve it for 30s. Cuts load a lot on busy pages.
export const publicCache = (req, res, next) => {
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=30, stale-while-revalidate=60");
  next();
};

// CSRF defence for cookie auth: a browser always sends the real Origin on POST/PUT/PATCH/DELETE.
// If it is present and not one of our frontends, the request is refused. (Stripe's webhook has
// no Origin header and is verified by its signature instead.)
export const originGuard = (req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const origin = req.headers.origin;
  if (origin && !env.allowedOrigins.includes(origin.replace(/\/$/, ""))) {
    return res.status(403).json({ success: false, message: "Origin not allowed" });
  }
  next();
};
