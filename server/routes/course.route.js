import express from "express";

import isAuthenticated from "../middleware/isAuthenticated.js";
import { isInstructor } from "../middleware/access.js";
import { validateObjectIdParam } from "../middleware/validate.js";
import { publicCache } from "../middleware/security.js";
import { uploadLimiter } from "../middleware/rateLimiter.js";
import { createCourse, getPublishedCourse, editCourse, getCreatorCourses, deleteCourse, getCourseById, createLecture, getLecture, editLecture, removeLecture, getLectureById, togglePublishCourse, searchCourse } from "../controller/course.controller.js";
import { uploadImage } from "../utils/multer.js";
const router = express.Router();

// malformed ids get a clean 400 instead of a database CastError
router.param("courseId", validateObjectIdParam);
router.param("lectureId", validateObjectIdParam);

// students: browse and search
router.route("/search").get(isAuthenticated, searchCourse);
router.route("/published-courses").get(publicCache, getPublishedCourse);

// instructors only (and, inside the controllers, only for their OWN courses)
router.route("/").post(isAuthenticated, isInstructor, createCourse);
router.route("/").get(isAuthenticated, isInstructor, getCreatorCourses);
router.route("/:courseId").put(isAuthenticated, isInstructor, uploadLimiter, uploadImage.single("courseThumbnail"), editCourse);
router.route("/:courseId").delete(isAuthenticated, isInstructor, deleteCourse);
router.route("/:courseId").get(isAuthenticated, isInstructor, getCourseById);
router.route("/:courseId").patch(isAuthenticated, isInstructor, togglePublishCourse);
router.route("/:courseId/lecture").post(isAuthenticated, isInstructor, createLecture);
router.route("/:courseId/lecture").get(isAuthenticated, isInstructor, getLecture);
router.route("/:courseId/lecture/:lectureId").post(isAuthenticated, isInstructor, editLecture);
router.route("/lecture/:lectureId").delete(isAuthenticated, isInstructor, removeLecture);
router.route("/lecture/:lectureId").get(isAuthenticated, isInstructor, getLectureById);
export default router;
