import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { validateObjectIdParam } from "../middleware/validate.js";
import { createOrUpdateReview, deleteReview, getCourseReviews } from "../controller/review.controller.js";

const router = express.Router();
router.param("courseId", validateObjectIdParam);
router.get("/:courseId", getCourseReviews);
router.post("/:courseId", isAuthenticated, createOrUpdateReview);
router.delete("/:courseId", isAuthenticated, deleteReview);

export default router;
