// Runs one copy of the server per CPU core, so a single Node process is no longer the limit.
//   npm run start:cluster          (WEB_CONCURRENCY=4 to choose the number of workers)
// Use this OR PM2 (ecosystem.config.cjs) - not both.
import cluster from "node:cluster";
import os from "node:os";

const entry = process.env.CLUSTER_ENTRY || "./index.js";

if (cluster.isPrimary) {
  const workerCount = Number(process.env.WEB_CONCURRENCY) || os.availableParallelism();
  console.log(`[cluster] primary ${process.pid} starting ${workerCount} workers`);

  let shuttingDown = false;
  const restarts = []; // timestamps, used to stop a crash loop

  for (let i = 0; i < workerCount; i++) cluster.fork();

  cluster.on("exit", (worker, code, signal) => {
    if (shuttingDown) {
      if (Object.keys(cluster.workers).length === 0) process.exit(0);
      return;
    }
    console.error(`[cluster] worker ${worker.process.pid} died (${signal || code}), restarting`);
    const now = Date.now();
    restarts.push(now);
    while (restarts.length && now - restarts[0] > 60_000) restarts.shift();
    if (restarts.length > workerCount * 5) {
      console.error("[cluster] workers keep crashing - giving up so the platform can alert you");
      process.exit(1);
    }
    setTimeout(() => cluster.fork(), 1000);
  });

  const stop = (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`[cluster] ${signal} received, stopping workers`);
    for (const worker of Object.values(cluster.workers)) worker.process.kill("SIGTERM");
    setTimeout(() => process.exit(1), 15_000).unref();
  };
  process.on("SIGTERM", () => stop("SIGTERM"));
  process.on("SIGINT", () => stop("SIGINT"));
} else {
  await import(entry);
}
