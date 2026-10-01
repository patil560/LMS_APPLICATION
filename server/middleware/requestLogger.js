import crypto from "node:crypto";
import { env } from "../config/env.js";

// Gives every request an id (returned in the X-Request-Id header) and logs one line per request.
// In production the line is JSON, ready for Datadog / CloudWatch / Loki. Query strings are NOT
// logged because they can contain tokens.
export const requestLogger = (req, res, next) => {
  const incoming = req.headers["x-request-id"];
  const requestId =
    typeof incoming === "string" && /^[A-Za-z0-9._-]{8,64}$/.test(incoming) ? incoming : crypto.randomUUID();
  req.requestId = requestId; // NOTE: req.id is already used for the logged-in user id
  res.setHeader("X-Request-Id", requestId);

  if (env.isTest || req.path === "/health" || req.path === "/ready") return next();

  const start = process.hrtime.bigint();
  res.on("finish", () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    const url = req.originalUrl.split("?")[0];
    if (env.isProd) {
      console.log(
        JSON.stringify({
          time: new Date().toISOString(),
          level: res.statusCode >= 500 ? "error" : "info",
          requestId,
          method: req.method,
          url,
          status: res.statusCode,
          ms: Math.round(ms * 10) / 10,
          ip: req.ip,
          userId: req.id,
        })
      );
    } else {
      console.log(`${req.method} ${url} ${res.statusCode} ${ms.toFixed(1)}ms`);
    }
  });
  next();
};
