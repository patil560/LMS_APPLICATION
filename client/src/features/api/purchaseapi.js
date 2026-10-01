import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@/config.js";

const COURSE_PURCHASE_API = `${API_URL}/api/v1/purchase`;

export const purchaseApi = createApi({
    reducerPath: "purchaseApi",
    tagTypes: ["Purchase"], // ADD THIS
    baseQuery: fetchBaseQuery({
        baseUrl: COURSE_PURCHASE_API,
        credentials: 'include'
    }),
    endpoints: (builder) => ({
        createCheckoutSession: builder.mutation({
            query: (courseId) => ({
                url: "/checkout/create-checkout-session",
                method: "POST",
                body: { courseId },
            }),
        }),
        // asks the server to confirm the Stripe payment and enroll the user
        verifySession: builder.mutation({
            query: (sessionId) => ({
                url: "/verify-session",
                method: "POST",
                body: { sessionId },
            }),
        }),
        getCoursedetailWithStatus: builder.query({
            query: (courseId) => ({
                url: `/course/${courseId}/detail-with-status`,
                method: "GET"
            }),
            providesTags: (result, error, courseId) => [{ type: "Purchase", id: courseId }], // ADD
        }),
        getPurchasedCourses: builder.query({
            query: () => ({
                url: "/",
                method: "GET"
            }),
            providesTags: ["Purchase"], // ADD
        }),
    })
});

export const {
    useCreateCheckoutSessionMutation,
    useVerifySessionMutation,
    useGetCoursedetailWithStatusQuery,
    useGetPurchasedCoursesQuery
} = purchaseApi;