//import { Filter } from "lucide-react";
import React, { useEffect, useState } from "react"
import Filter from "./filter"
import SearchResult from "./searchresult"
import { Skeleton } from "@/components/ui/skeleton";
import { useGetSearchCoursesQuery } from "@/features/api/courseapi";
import { useSearchParams } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import Pagination from "@/components/Pagination.jsx";


const SearchPage = () => {


    const [searchParams] = useSearchParams();
    const query = searchParams.get("query");
    const [selectedcategories,setSelectedCategories] = useState([]);
    const [sortByPrice,setSortByPrice] = useState("");
    const [page, setPage] = useState(1);
    const { data, isLoading, isFetching } = useGetSearchCoursesQuery({
        searchQuery:query,
        categories:selectedcategories,
        sortByPrice,
        page,
        limit: 10
    });

    // a new search word always starts at page 1
    useEffect(() => { setPage(1); }, [query]);

   // console.log(data?.courses)
    const courses = data?.courses ?? [];
    const isEmpty = !isLoading && courses.length === 0;
    // const isLoading = false;
    //const isEmpty = false;

    const handleFilterChange = ({categories,price}) =>{
        setSelectedCategories(categories);
        setSortByPrice(price);
        setPage(1); // changing a filter always starts at page 1
    }

    return (
        <div className=" mt-10 max-w-7xl mx-auto p-4 md:p-8 ">
            <div className="my-6">
                <h1 className="font-bold text-xl md:text-2xl">result for "{query}"</h1>
                <p>showing results for
                    <span className="text-blue-800 font-bold italic">{query}</span>
                </p>
            </div>
            <div className="flex flex-col md:flex-row gap-10">
                <Filter handleFilterChange={handleFilterChange}/>
                <div className="flex-1">
                    {
                        isLoading ? (
                            Array.from({ length: 4 }).map((_, idx) => (
                                <CourseSkeleton key={idx} />
                            ))
                        ) : isEmpty ? (<CourseNotFound />) : (
                           data?.courses.map((course, index) => (
                                <SearchResult key={course._id} course={course} />
                            ))
                        )
                    }
                    <Pagination pagination={data?.pagination} onPageChange={setPage} disabled={isFetching} />
                </div>
            </div>
        </div>

    )
}

export default SearchPage;

const CourseSkeleton = () => {
    return (
        <div className="flex-1 flex flex-col md:flex-row justify-between gap-5">
            <div className="h-32 w-full object-cover">
                <Skeleton className="w-full h-36" />
            </div>

            <div className="flex flex-col gap-2 flex-1 px-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-1/3" />
                </div>
                <Skeleton className="h-6 w-20 mt-2" />
            </div>
            <div className="flex flex-col items-end jsutify-between mt-4">
                <Skeleton className="h-6 w-12 " />
            </div>
        </div>

    )
}

const CourseNotFound = () => {
    return (
        <div className="flex flex-col items-center justify-between min-h-32">
            <AlertCircle className="text-red-500 h-16 w-16 mb-4"/>
            <h1 className="font-bold text-2xl md:text-4xl text-gray-800 dark:text-gray-300">
                Course Not Found
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                Sorry We couden't find the course you're looking for.
            </p>
        </div>
    )
}