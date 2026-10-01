import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  },
  { timestamps: true }
);

wishlistSchema.index({ userId: 1, courseId: 1 }, { unique: true });
wishlistSchema.index({ userId: 1, createdAt: -1 });

export const Wishlist = mongoose.model("Wishlist", wishlistSchema);
