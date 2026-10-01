// PM2 process manager config:  npm i -g pm2 && pm2 start ecosystem.config.cjs --env production
// PM2 runs one worker per CPU core, restarts crashed workers and supports zero-downtime reloads
// (pm2 reload lms-api). Use this OR `npm run start:cluster`, not both.
module.exports = {
  apps: [
    {
      name: "lms-api",
      script: "index.js",
      instances: "max",
      exec_mode: "cluster",
      max_memory_restart: "500M",
      kill_timeout: 10000,
      env: { NODE_ENV: "development" },
      env_production: { NODE_ENV: "production" },
    },
  ],
};
