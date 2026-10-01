import express from "express";
import { register, login, getUserProfile, logout, updateProfile } from "../controller/user.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { uploadImage } from "../utils/multer.js";
import { authLimiter, loginAccountLimiter, uploadLimiter } from "../middleware/rateLimiter.js";
import { validateRegister, validateLogin } from "../middleware/validate.js";

const router = express.Router();

// limiters run first so even invalid attempts are counted
router.route("/register").post(authLimiter, validateRegister, register);
router.route("/login").post(authLimiter, validateLogin, loginAccountLimiter, login);
router.route("/logout").get(logout);
router.route("/profile").get(isAuthenticated, getUserProfile);
router.route("/profile/update").put(isAuthenticated, uploadLimiter, uploadImage.single("profilePhoto"), updateProfile);
export default router;
