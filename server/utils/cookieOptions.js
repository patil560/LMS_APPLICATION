import { env } from "../config/env.js";

// One place that decides how the auth cookie is set (login + logout must match).
export const authCookieOptions = (maxAge) => ({
  httpOnly: true, // JavaScript in the browser cannot read it (protects against XSS token theft)
  secure: env.cookieSecure, // HTTPS only in production
  sameSite: env.cookieSameSite,
  ...(maxAge !== undefined ? { maxAge } : {}),
});
