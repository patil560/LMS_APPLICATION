import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@/config.js";

const REVIEW_API = `${API_URL}/api/v1/reviews`;

export const reviewApi = createApi({
  reducerPath: "reviewApi",
  tagTypes: ["Reviews"],
  baseQuery: fetchBaseQuery({ baseUrl: REVIEW_API, credentials: "include" }),
  endpoints: (builder) => ({
    getCourseReviews: builder.query({
      query: (courseId) => `/${courseId}`,
      providesTags: (result, error, courseId) => [{ type: "Reviews", id: courseId }],
    }),
    saveReview: builder.mutation({
      query: ({ courseId, rating, comment }) => ({ url: `/${courseId}`, method: "POST", body: { rating, comment } }),
      invalidatesTags: (result, error, { courseId }) => [{ type: "Reviews", id: courseId }],
    }),
    deleteReview: builder.mutation({
      query: (courseId) => ({ url: `/${courseId}`, method: "DELETE" }),
      invalidatesTags: (result, error, courseId) => [{ type: "Reviews", id: courseId }],
    }),
  }),
});

export const { useGetCourseReviewsQuery, useSaveReviewMutation, useDeleteReviewMutation } = reviewApi;
