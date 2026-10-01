import Course from "../model/course.model.js";
import { Wishlist } from "../model/wishlist.model.js";

export const getWishlist = async (req, res) => {
  try {
    const items = await Wishlist.find({ userId: req.id })
      .sort({ createdAt: -1 })
      .populate({ path: "courseId", populate: { path: "creator", select: "name photourl" } })
      .lean();
    return res.status(200).json({ success: true, courses: items.map((item) => item.courseId).filter(Boolean) });
  } catch (error) {
    console.error("getWishlist error:", error);
    return res.status(500).json({ success: false, message: "Failed to load wishlist" });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findOne({ _id: courseId, isPublished: true }).select("_id").lean();
    if (!course) return res.status(404).json({ success: false, message: "Published course not found" });

    await Wishlist.updateOne({ userId: req.id, courseId }, { $setOnInsert: { userId: req.id, courseId } }, { upsert: true });
    return res.status(200).json({ success: true, wishlisted: true, message: "Added to wishlist" });
  } catch (error) {
    console.error("addToWishlist error:", error);
    return res.status(500).json({ success: false, message: "Failed to update wishlist" });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { courseId } = req.params;
    await Wishlist.deleteOne({ userId: req.id, courseId });
    return res.status(200).json({ success: true, wishlisted: false, message: "Removed from wishlist" });
  } catch (error) {
    console.error("removeFromWishlist error:", error);
    return res.status(500).json({ success: false, message: "Failed to update wishlist" });
  }
};

export const getWishlistStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const wishlisted = Boolean(await Wishlist.exists({ userId: req.id, courseId }));
    return res.status(200).json({ success: true, wishlisted });
  } catch (error) {
    console.error("getWishlistStatus error:", error);
    return res.status(500).json({ success: false, message: "Failed to check wishlist" });
  }
};
