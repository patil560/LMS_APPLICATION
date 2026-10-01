import { env } from "./config/env.js"; // must stay the FIRST import (loads + validates .env)
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import userRoutes from "./routes/user.route.js";
import courseRoute from "./routes/course.route.js";
import mediaRoute from "./routes/media.route.js";
import purchaseRoute from "./routes/purchaseCourse.route.js";
import courseProgressRoute from "./routes/courseProgress.route.js";
import reviewRoute from "./routes/review.route.js";
import wishlistRoute from "./routes/wishlist.route.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { securityHeaders, sanitizeBody, originGuard } from "./middleware/security.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.disable("x-powered-by"); // do not advertise "Express"
if (env.trustProxy) app.set("trust proxy", env.trustProxy);

app.use(requestLogger);
app.use(securityHeaders);

// Health checks for load balancers, Docker and Kubernetes (no auth, no rate limit).
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: Math.round(process.uptime()) });
});
app.get("/ready", (req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ status: ready ? "ready" : "not ready", database: ready ? "connected" : "disconnected" });
});

app.use(
  cors({
    origin: (origin, callback) => callback(null, !origin || env.allowedOrigins.includes(origin)),
    credentials: true,
  })
);

app.use("/api", apiLimiter); // before body parsing, so abusive clients are rejected cheaply
app.use(originGuard);

// IMPORTANT: Stripe's webhook needs the RAW body to verify its signature,
// so this must be registered BEFORE express.json().
app.use("/api/v1/purchase/webhook", express.raw({ type: "application/json" }));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
app.use(sanitizeBody);

app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/purchase", purchaseRoute);
app.use("/api/v1/progress", courseProgressRoute);
app.use("/api/v1/reviews", reviewRoute);
app.use("/api/v1/wishlist", wishlistRoute);

app.use(notFound);
app.use(errorHandler);

export default app;
