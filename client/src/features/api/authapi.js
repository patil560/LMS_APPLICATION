import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn, userLoggedOut } from "../authSlice.js";
import { API_URL } from "@/config.js";
import { courseApi } from "./courseapi.js";
import { purchaseApi } from "./purchaseapi.js";
import { CourseProgressApi } from "./courseprogressapi.js";
import { reviewApi } from "./reviewapi.js";
import { wishlistApi } from "./wishlistapi.js";

const USER_API = `${API_URL}/api/v1/user`;

export const authapi = createApi({
  reducerPath: "authapi",
  baseQuery: fetchBaseQuery({
    baseUrl: USER_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (userData) => ({
        url: "/register",
        method: "POST",
        body: userData,
      }),
    }),

    loginUser: builder.mutation({
      query: (userData) => ({
        url: "/login",
        method: "POST",
        body: userData,
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          dispatch(
            userLoggedIn({
              user: result.data.user,
              token: result.data.token,
            })
          );
        } catch (error) {
          console.error("Login failed:", error);
        }
      },
    }),

    logoutUser: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "GET",
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          await queryFulfilled;
          dispatch(userLoggedOut());
          dispatch(authapi.util.resetApiState());
          dispatch(courseApi.util.resetApiState());
          dispatch(purchaseApi.util.resetApiState());
          dispatch(CourseProgressApi.util.resetApiState());
          dispatch(reviewApi.util.resetApiState());
          dispatch(wishlistApi.util.resetApiState());
        } catch (error) {
          dispatch(userLoggedOut());
          dispatch(authapi.util.resetApiState());
          dispatch(courseApi.util.resetApiState());
          dispatch(purchaseApi.util.resetApiState());
          dispatch(CourseProgressApi.util.resetApiState());
          dispatch(reviewApi.util.resetApiState());
          dispatch(wishlistApi.util.resetApiState());
          console.error("Logout failed:", error);
        }
      },
    }),

    loadUser: builder.query({
      query: () => ({
        url: "/profile",
        method: "GET",
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          dispatch(
            userLoggedIn({
              user: result.data.user,
              token: result.data.token,
            })
          );
        } catch (error) {
          console.error("Load user failed:", error);
        }
      },
    }),

    updateUser: builder.mutation({
      query: (formdata) => ({
        url: "/profile/update",
        method: "PUT",
        body: formdata,
      }),
    }),
  }),
});

export const {
  useUpdateUserMutation,
  useRegisterUserMutation,
  useLoginUserMutation,
  useLoadUserQuery,
  useLogoutUserMutation,
} = authapi;