import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { validateObjectIdParam } from "../middleware/validate.js";
import { addToWishlist, getWishlist, getWishlistStatus, removeFromWishlist } from "../controller/wishlist.controller.js";

const router = express.Router();
router.param("courseId", validateObjectIdParam);
router.get("/", isAuthenticated, getWishlist);
router.get("/:courseId/status", isAuthenticated, getWishlistStatus);
router.post("/:courseId", isAuthenticated, addToWishlist);
router.delete("/:courseId", isAuthenticated, removeFromWishlist);

export default router;
