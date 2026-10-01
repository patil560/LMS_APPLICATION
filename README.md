# LMS
A Learning Management System built with Node.js, Express.js, React, and MongoDB.

## Run locally
```bash
# server  (copy server/.example.env to server/.env and fill it in)
cd server && npm install && npm run dev        # auto-reload for development

# client  (optional: copy client/.env.example to client/.env)
cd client && npm install && npm run dev
```
For Stripe in development run `stripe listen --forward-to localhost:8080/api/v1/purchase/webhook`
and put the printed `whsec_...` value in `WEBHOOK_ENDPOINT_SECRET`.

## Production checklist
1. `NODE_ENV=production`, a `JWT_SECRET` of 32+ random characters, and all variables in `server/.example.env`.
2. Behind a proxy/load balancer (Render, Heroku, nginx...) set `TRUST_PROXY=1`, otherwise rate limiting sees one IP for everybody.
3. Frontend and API on different domains? Set `COOKIE_SAMESITE=none` (HTTPS required) and `FRONTEND_URL` to the frontend origin.
4. Run more than one process: `npm run start:cluster` (or PM2: `pm2 start ecosystem.config.cjs --env production`, or the Dockerfile).
5. Point your load balancer's health check to `GET /health` and readiness to `GET /ready`.
6. Create a Stripe webhook endpoint for `checkout.session.completed` -> `https://YOUR_API/api/v1/purchase/webhook`.
7. Build the client with `VITE_API_URL=https://YOUR_API npm run build` and serve `client/dist` from a CDN/static host.
8. `npm test` in `server/` must pass before every deploy (CI does this automatically).

Instructors are users whose `role` is `instructor` in the `users` collection.
## Local setup after the production-oriented upgrades

### 1. Backend

```bash
cd server
cp .example.env .env
npm install
npm run dev
```

On Windows, copy `.example.env` to `.env` manually if `cp` is unavailable.

Required backend values are documented in `server/.example.env`: MongoDB, JWT, Stripe, and Cloudinary credentials.

### 2. Frontend

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Set `VITE_API_URL=http://localhost:8080` for local development.

### 3. Stripe local webhook (only when testing payments)

```bash
stripe listen --forward-to localhost:8080/api/v1/purchase/webhook
```

Copy the generated `whsec_...` value into `WEBHOOK_ENDPOINT_SECRET`.

### Added features

- Course reviews and 1-5 star ratings (only after course completion)
- Student wishlist
- Printable course completion certificate / Save as PDF
- Stronger completion validation: a course cannot be marked complete until every lecture has been viewed
- Course-deletion cleanup for reviews, wishlist entries, purchases, and progress
- Optional public HTTP caching remains dependency-free, so local setup does not require Redis

