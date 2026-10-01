import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@/config.js";

const COURSE_PROGRESS_API=`${API_URL}/api/v1/progress`

export const CourseProgressApi = createApi({
    reducerPath:"CourseProgressApi",
    baseQuery:fetchBaseQuery({
        baseUrl:COURSE_PROGRESS_API,
        credentials:"include"
    }),
    endpoints:(builder)=>({
        getCourseProgress:builder.query({
            query:(courseId)=>({
                url:`/${courseId}`,
                method:"GET"
            })
        }),
        updateLectureProgress:builder.mutation({
            query:({courseId,lectureId})=>({
                url:`/${courseId}/lecture/${lectureId}/view`,
                method:"POST"
            }),
        }),

        completeCourse:builder.mutation({
            query:(courseId)=>({
                url:`/${courseId}/completed`,
                method:"POST"
            })
        }),

        inCompleteCourse:builder.mutation({
            query:(courseId) =>({
                 url:`/${courseId}/incompleted`,
                method:"POST"
            }),
        }),
    }),
})


export const {
    useGetCourseProgressQuery,
    useUpdateLectureProgressMutation,
    useCompleteCourseMutation,
    useInCompleteCourseMutation
     
} = CourseProgressApi;