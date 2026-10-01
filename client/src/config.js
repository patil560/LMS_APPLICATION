// Base URL of the backend. Set VITE_API_URL in client/.env (see .env.example) for staging/production.
export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/$/, "");
