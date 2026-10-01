import { env } from "../config/env.js";

export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl.split("?")[0]}`,
  });
};

// Last line of defence: turns any error that reaches Express into a clean JSON answer
// (bad JSON, oversized upload, wrong file type, invalid id ...) and never leaks stack traces in production.
export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  let status = err.status || err.statusCode || 500;
  let message = err.message || "Internal server error";

  if (err.type === "entity.parse.failed") {
    status = 400;
    message = "Invalid JSON body";
  } else if (err.type === "entity.too.large") {
    status = 413;
    message = "Request body too large";
  } else if (err.name === "MulterError") {
    status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    message = err.code === "LIMIT_FILE_SIZE" ? "File is too large" : `Upload error: ${err.message}`;
  } else if (err.code === "INVALID_FILE_TYPE") {
    status = 415;
  } else if (err.name === "CastError") {
    status = 400;
    message = "Invalid id or value";
  } else if (err.name === "ValidationError") {
    status = 400;
  } else if (err.code === 11000) {
    status = 409;
    message = "Duplicate value";
  }

  if (status >= 500) {
    console.error(
      JSON.stringify({ level: "error", requestId: req.requestId, url: req.originalUrl.split("?")[0], error: err.stack || String(err) })
    );
    if (env.isProd) message = "Internal server error";
  }

  res.status(status).json({
    success: false,
    message,
    ...(env.isProd || status < 500 ? {} : { stack: err.stack }),
  });
};
