import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { requireEnrollment } from "../middleware/access.js";
import { validateObjectIdParam } from "../middleware/validate.js";
import { getCourseProgress, markAsCompleted, markAsInCompleted, updateLectureProgress } from "../controller/courseProgress.controller.js";

const router = express.Router()

router.param("courseId", validateObjectIdParam);
router.param("lectureId", validateObjectIdParam);

// every progress route needs a logged-in user who has bought (or owns) the course
router.route("/:courseId").get(isAuthenticated, requireEnrollment, getCourseProgress);
router.route("/:courseId/lecture/:lectureId/view").post(isAuthenticated, requireEnrollment, updateLectureProgress);
router.route("/:courseId/completed").post(isAuthenticated, requireEnrollment, markAsCompleted);
router.route("/:courseId/incompleted").post(isAuthenticated, requireEnrollment, markAsInCompleted);

export default router;
