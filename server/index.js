import { env } from "./config/env.js";
import mongoose from "mongoose";
import app from "./app.js";
import connectDB from "./database/dbconnect.js";

await connectDB(); // do not accept traffic until the database is reachable


const PORT = process.env.PORT || env.port || 5000;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `app is running on port ${PORT} (${env.nodeEnv}) pid ${process.pid}`
  );
});
// const server = app.listen(env.port, () => {
//   console.log(`app is running on port ${env.port} (${env.nodeEnv}) pid ${process.pid}`);
// });

// Longer than typical load-balancer idle timeouts (AWS ALB = 60s) to avoid random 502s.
server.keepAliveTimeout = 65_000;
server.headersTimeout = 66_000;

server.on("error", (err) => {
  console.error("error is " + err);
  process.exit(1);
});

// Graceful shutdown: stop taking new requests, let running ones finish, close the DB, exit.
let shuttingDown = false;
const shutdown = (signal, exitCode = 0) => {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[shutdown] ${signal} received, closing server...`);
  server.close(async () => {
    try {
      await mongoose.connection.close();
    } finally {
      process.exit(exitCode);
    }
  });
  setTimeout(() => process.exit(1), 10_000).unref(); // never hang forever
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("uncaughtException", (err) => {
  console.error("[fatal] uncaughtException", err);
  shutdown("uncaughtException", 1);
});
process.on("unhandledRejection", (reason) => {
  console.error("[error] unhandledRejection", reason);
});
