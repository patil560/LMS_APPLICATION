import React from "react";
import Course from "./Course";
import { useGetWishlistQuery } from "@/features/api/wishlistapi.js";

const Wishlist = () => {
  const { data, isLoading, isError } = useGetWishlistQuery();
  const courses = data?.courses || [];

  if (isLoading) return <p className="p-8 text-center">Loading wishlist...</p>;
  if (isError) return <p className="p-8 text-center">Failed to load wishlist.</p>;

  return (
    <div className="mx-auto max-w-7xl p-6 pt-10">
      <h1 className="mb-6 text-2xl font-bold">My Wishlist</h1>
      {courses.length === 0 ? (
        <p>No courses saved yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {courses.map((course) => <Course key={course._id} course={course} />)}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
