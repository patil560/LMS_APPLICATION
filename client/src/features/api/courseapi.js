//import CreateLecture from "@/pages/admin/lecture/createLecture";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@/config.js";

const COURSE_API = `${API_URL}/api/v1/course`;

export const courseApi = createApi({
  reducerPath: "courseApi",
  tagTypes: ["Refetch_Creator_course", "Refetch_Lecture", "Refetch_Course", "Refetch_Published"],//we use to see course when we create new that time it immidiatly fetch new course info and show on course route
  baseQuery: fetchBaseQuery({
    baseUrl: COURSE_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    createCourse: builder.mutation({
      query: ({ courseTitle, category }) => ({
        url: "",
        method: "POST",
        body: { courseTitle, category },
      }),
      invalidatesTags: ["Refetch_Creator_course"]//refeching course
    }),
    getSearchCourses:builder.query({
      query:({searchQuery,categories,sortByPrice,page=1,limit=10})=>{
       //build query string
       let queryString =`search?query=${encodeURIComponent(searchQuery ?? "") }`;
        //append category
        if(categories && categories.length > 0){
          const categoriesString = categories.map((category) => encodeURIComponent(category)).join(",");
          queryString += `&categories=${categoriesString}`;
        }
       //append sort by price 
       if(sortByPrice){
        queryString += `&sortByPrice=${encodeURIComponent(sortByPrice)}`
       }

       queryString += `&page=${page}&limit=${limit}`;

       return{
        url:queryString,
        method:"GET",
        
        
       }
      }
    }),
    getPublishedCourse: builder.query({
      query: ({ page = 1, limit = 12 } = {}) => ({
        url: `/published-courses?page=${page}&limit=${limit}`,
        method: "GET"
      }),
      providesTags: ["Refetch_Published"]
    }),

    getCreatorCourses: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: `?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["Refetch_Creator_course"]//refeching immediatily course
    }),
    editCourse: builder.mutation({
      query: ({ formData, courseId }) => ({
        url: `/${courseId}`,
        method: "PUT",
        body: formData
      }),
      invalidatesTags: ["Refetch_Creator_course", "Refetch_Course"]//refeching course
    }),
    getCourseById: builder.query({
      query: (courseId) => ({
        url: `/${courseId}`,
        method: "GET",
      }),
      providesTags: ["Refetch_Course"]
    }),

    createLecture: builder.mutation({
      query: ({ lectureTitle, courseId }) => ({
        url: `/${courseId}/lecture`,
        method: "POST",
        body: { lectureTitle }
      }),
    }),
    getCourseLecture: builder.query({
      query: (courseId) => ({
        url: `/${courseId}/lecture`,
        method: "GET",
      }),
      providesTags: ["Refetch_Lecture"]
    }),

    editLecture: builder.mutation({
      query: ({ lectureTitle, videoInfo, isPreviewFree, courseId, lectureId }) => ({
        url: `/${courseId}/lecture/${lectureId}`,
        method: "POST",
        body: { lectureTitle, videoInfo, isPreviewFree }
      }),
      invalidatesTags: ["Refetch_Lecture"]
    }),

    removeLecture: builder.mutation({
      query: (lectureId) => ({
        url: `/lecture/${lectureId}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Refetch_Lecture"]
    }),

    getLectureById: builder.query({
      query: (lectureId) => ({
        url: `/lecture/${lectureId}`,
        method: "GET",
      })
    }),

    publishCourse: builder.mutation({
      query: ({ courseId, query }) => ({
        url: `/${courseId}?publish=${query}`,
        method: "PATCH"
      }),
      invalidatesTags: ["Refetch_Creator_course", "Refetch_Course", "Refetch_Published"]
    }),

    removeCourse: builder.mutation({
      query: (courseId) => ({
        url: `/${courseId}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Refetch_Creator_course", "Refetch_Published"]
    }),

  }),
});

export const {
  useCreateCourseMutation,
  useGetSearchCoursesQuery,
  useGetPublishedCourseQuery,
  useGetCreatorCoursesQuery,
  useEditCourseMutation,
  useGetCourseByIdQuery,
  useCreateLectureMutation,
  useGetCourseLectureQuery,
  useEditLectureMutation,
  useRemoveLectureMutation,
  useGetLectureByIdQuery,
  usePublishCourseMutation,
  useRemoveCourseMutation,

} = courseApi;