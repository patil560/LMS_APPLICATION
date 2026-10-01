import React, { useState } from "react";
import { Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { useGetCourseReviewsQuery, useSaveReviewMutation, useDeleteReviewMutation } from "@/features/api/reviewapi.js";

const ReviewSection = ({ courseId, canReview = false }) => {
  const user = useSelector((state) => state.auth.user);
  const { data, isLoading } = useGetCourseReviewsQuery(courseId);
  const [saveReview, { isLoading: saving }] = useSaveReviewMutation();
  const [deleteReview] = useDeleteReviewMutation();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const reviews = data?.reviews || [];
  const ownReview = reviews.find((review) => String(review.userId?._id) === String(user?._id));

  const submit = async (e) => {
    e.preventDefault();
    try {
      await saveReview({ courseId, rating, comment }).unwrap();
      toast.success("Review saved");
      setComment("");
    } catch (error) {
      toast.error(error?.data?.message || "Unable to save review");
    }
  };

  const remove = async () => {
    try { await deleteReview(courseId).unwrap(); toast.success("Review deleted"); }
    catch (error) { toast.error(error?.data?.message || "Unable to delete review"); }
  };

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold">Reviews</h2>
      {canReview && (
        <form onSubmit={submit} className="space-y-3 rounded-lg border p-4">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button type="button" key={value} onClick={() => setRating(value)} aria-label={`${value} stars`}>
                <Star className={value <= rating ? "fill-current" : ""} />
              </button>
            ))}
          </div>
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder={ownReview ? "Update your review..." : "Share your experience..."} maxLength={1000} />
          <Button type="submit" disabled={saving}>{saving ? "Saving..." : ownReview ? "Update review" : "Submit review"}</Button>
          {ownReview && <Button type="button" variant="ghost" onClick={remove}><Trash2 className="mr-2 h-4 w-4" /> Delete review</Button>}
        </form>
      )}
      {isLoading ? <p>Loading reviews...</p> : reviews.length === 0 ? <p className="text-sm text-gray-500">No reviews yet.</p> : reviews.map((review) => (
        <article key={review._id} className="rounded-lg border p-4">
          <div className="flex items-center justify-between gap-4">
            <strong>{review.userId?.name || "Student"}</strong>
            <span className="flex items-center gap-1">{review.rating}/5 <Star className="h-4 w-4 fill-current" /></span>
          </div>
          <p className="mt-2 text-sm">{review.comment}</p>
        </article>
      ))}
    </div>
  );
};

export default ReviewSection;
