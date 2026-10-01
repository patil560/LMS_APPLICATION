import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@/config.js";

const WISHLIST_API = `${API_URL}/api/v1/wishlist`;

export const wishlistApi = createApi({
  reducerPath: "wishlistApi",
  tagTypes: ["Wishlist"],
  baseQuery: fetchBaseQuery({ baseUrl: WISHLIST_API, credentials: "include" }),
  endpoints: (builder) => ({
    getWishlist: builder.query({
      query: () => "/",
      providesTags: ["Wishlist"],
    }),
    getWishlistStatus: builder.query({
      query: (courseId) => `/${courseId}/status`,
      providesTags: (result, error, courseId) => [{ type: "Wishlist", id: courseId }],
    }),
    addToWishlist: builder.mutation({
      query: (courseId) => ({ url: `/${courseId}`, method: "POST" }),
      invalidatesTags: ["Wishlist"],
    }),
    removeFromWishlist: builder.mutation({
      query: (courseId) => ({ url: `/${courseId}`, method: "DELETE" }),
      invalidatesTags: ["Wishlist"],
    }),
  }),
});

export const {
  useGetWishlistQuery,
  useGetWishlistStatusQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} = wishlistApi;
