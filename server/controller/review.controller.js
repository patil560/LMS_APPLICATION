import mongoose from "mongoose";
import Course from "../model/course.model.js";
import { CoursePurchase } from "../model/purchaseCourse.model.js";
import { CourseProgress } from "../model/courseprogress.model.js";
import { CourseReview } from "../model/review.model.js";

const enrolled = async (userId, courseId) => {
  const [purchase, progress] = await Promise.all([
    CoursePurchase.exists({ userId, courseId, status: "completed" }),
    CourseProgress.findOne({ userId: String(userId), courseId: String(courseId) }).select("completed").lean(),
  ]);
  return Boolean(purchase) && Boolean(progress?.completed);
};

const refreshRating = async (courseId) => {
  const objectId = new mongoose.Types.ObjectId(courseId);
  const stats = await CourseReview.aggregate([
    { $match: { courseId: objectId } },
    { $group: { _id: "$courseId", averageRating: { $avg: "$rating" }, ratingCount: { $sum: 1 } } },
  ]);
  const averageRating = stats[0] ? Number(stats[0].averageRating.toFixed(1)) : 0;
  const ratingCount = stats[0]?.ratingCount || 0;
  await Course.findByIdAndUpdate(courseId, { averageRating, ratingCount });
  return { averageRating, ratingCount };
};

export const getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;
    const reviews = await CourseReview.find({ courseId })
      .populate("userId", "name photourl")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    return res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error("getCourseReviews error:", error);
    return res.status(500).json({ success: false, message: "Failed to load reviews" });
  }
};

export const createOrUpdateReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const rating = Number(req.body.rating);
    const comment = String(req.body.comment || "").trim();

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be an integer from 1 to 5" });
    }
    if (comment.length < 3 || comment.length > 1000) {
      return res.status(400).json({ success: false, message: "Review must be between 3 and 1000 characters" });
    }

    const course = await Course.findById(courseId).select("isPublished").lean();
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    if (!course.isPublished) return res.status(400).json({ success: false, message: "You cannot review an unpublished course" });
    if (!(await enrolled(req.id, courseId))) {
      return res.status(403).json({ success: false, message: "Complete the course before reviewing it" });
    }

    const review = await CourseReview.findOneAndUpdate(
      { courseId, userId: req.id },
      { rating, comment },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate("userId", "name photourl");

    const ratingSummary = await refreshRating(courseId);
    return res.status(200).json({ success: true, review, ...ratingSummary, message: "Review saved successfully" });
  } catch (error) {
    console.error("createOrUpdateReview error:", error);
    return res.status(500).json({ success: false, message: "Failed to save review" });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const deleted = await CourseReview.findOneAndDelete({ courseId, userId: req.id });
    if (!deleted) return res.status(404).json({ success: false, message: "Review not found" });
    const ratingSummary = await refreshRating(courseId);
    return res.status(200).json({ success: true, ...ratingSummary, message: "Review deleted" });
  } catch (error) {
    console.error("deleteReview error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete review" });
  }
};
