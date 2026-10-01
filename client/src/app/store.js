import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice.js";
import { authapi } from "../features/api/authapi.js";
import { courseApi } from "@/features/api/courseapi.js";
import {purchaseApi} from "@/features/api/purchaseapi.js"
import { CourseProgressApi } from "@/features/api/courseprogressapi.js";
import { reviewApi } from "@/features/api/reviewapi.js";
import { wishlistApi } from "@/features/api/wishlistapi.js";

export const appStore = configureStore({
  reducer: {
    auth: authReducer,
    [authapi.reducerPath]: authapi.reducer,
    [courseApi.reducerPath]:courseApi.reducer,
    [purchaseApi.reducerPath]:purchaseApi.reducer,
    [CourseProgressApi.reducerPath]:CourseProgressApi.reducer,
    [reviewApi.reducerPath]: reviewApi.reducer,
    [wishlistApi.reducerPath]: wishlistApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authapi.middleware,courseApi.middleware,purchaseApi.middleware,CourseProgressApi.middleware, reviewApi.middleware, wishlistApi.middleware),
});