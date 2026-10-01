import User from "../model/user.model.js";
import Course from "../model/course.model.js";
import { CoursePurchase } from "../model/purchaseCourse.model.js";

// Only users whose role is "instructor" may manage courses and upload media.
export const isInstructor = async (req, res, next) => {
  const user = await User.findById(req.id).select("role").lean();
  if (!user) {
    return res.status(401).json({ success: false, message: "user not authenticated" });
  }
  if (user.role !== "instructor") {
    return res.status(403).json({ success: false, message: "Only instructors can perform this action" });
  }
  next();
};

// Course content (videos, progress) is only for students who paid, or for the course's own instructor.
export const requireEnrollment = async (req, res, next) => {
  const { courseId } = req.params;

  const course = await Course.findById(courseId).select("creator").lean();
  if (!course) {
    return res.status(404).json({ success: false, message: "course not found" });
  }
  if (String(course.creator) === String(req.id)) return next();

  const [paid, enrolled] = await Promise.all([
    CoursePurchase.exists({ userId: req.id, courseId, status: "completed" }),
    User.exists({ _id: req.id, enrolledCourses: courseId }),
  ]);
  if (!paid && !enrolled) {
    return res.status(403).json({ success: false, message: "You are not enrolled in this course" });
  }
  next();
};
