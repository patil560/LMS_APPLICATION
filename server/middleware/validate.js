import mongoose from "mongoose";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const fail = (res, errors) =>
  res.status(400).json({ success: false, message: errors[0], errors });

// Registration: names, a real-looking email and a decent password (bcrypt only reads 72 bytes).
export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body || {};
  const errors = [];

  if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 60) {
    errors.push("Name must be between 2 and 60 characters");
  }
  if (typeof email !== "string" || email.length > 254 || !EMAIL_RE.test(email.trim())) {
    errors.push("Please provide a valid email address");
  }
  if (typeof password !== "string" || password.length < 8 || Buffer.byteLength(password) > 72) {
    errors.push("Password must be at least 8 characters (maximum 72)");
  }

  if (errors.length) return fail(res, errors);
  next();
};

// Login: only checks the TYPE (so objects / arrays can never reach the database query).
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body || {};
  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return fail(res, ["Please provide email and password"]);
  }
  if (email.length > 254 || password.length > 200) {
    return fail(res, ["Invalid email or password"]);
  }
  next();
};

// router.param(...) handler: rejects malformed ids with 400 instead of a 500 CastError.
export const validateObjectIdParam = (req, res, next, value) => {
  if (!mongoose.isValidObjectId(value) || String(value).length !== 24) {
    return res.status(400).json({ success: false, message: "Invalid id" });
  }
  next();
};
