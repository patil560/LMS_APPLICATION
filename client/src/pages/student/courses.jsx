import React, { useRef, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton";
import Course from "./Course.jsx"
import Pagination from "@/components/Pagination.jsx";
import { useGetPublishedCourseQuery } from "@/features/api/courseapi.js";

const PAGE_SIZE = 12;

const Courses = () => {
    const [page, setPage] = useState(1);
    const topRef = useRef(null);

    const { data, isLoading, isFetching, isError } = useGetPublishedCourseQuery({ page, limit: PAGE_SIZE });

    const changePage = (newPage) => {
        setPage(newPage);
        topRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    if (isError) return <p> Some Error occured while fetching courses. </p>

    return (
        <div className="bg-gray-50 dark:bg-[#141414]" ref={topRef}>
            <div className="max-w-7xl mx-auto p-6">
                <h2 className="font-bold text-3xl text-center mb-10">Our Courses</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {/* adding  skeletion or blank cards before getting any data from database */}
                    {
                        isLoading ? (Array.from({ length: 8 }).map((_, index) => (
                            <CourseSkeleton key={index} />
                        ))
                        ) : (
                            data?.courses && data?.courses.map((course) => <Course key={course._id} course={course} />)
                        )
                    }
                </div>
                <Pagination pagination={data?.pagination} onPageChange={changePage} disabled={isFetching} />
            </div>
        </div>
    )

}

export default Courses;

const CourseSkeleton = () => {
    return (
        <div className="bg-white shadow-md hover:shadow-lg transition-shadow rouned-lg overflow-hidden">
            <Skeleton className="w-full h-36" />
            <div className="px-5 py-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <div className="flex items-center justify-center">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className=" h-4 w-1/4" />
            </div>
        </div>
    )
}
