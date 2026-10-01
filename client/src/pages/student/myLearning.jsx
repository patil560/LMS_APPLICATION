import React from "react";
import Course from "./Course";
import {useLoadUserQuery} from "@/features/api/authapi.js"

const MyLearning = () => {
    //const isLoading = false;
   
    const {data,isLoading} = useLoadUserQuery(undefined, { refetchOnMountOrArgChange: true });
    
     const mylearning = data?.user.enrolledCourses || [];
   console.log(mylearning)
    return (
        <div className="max-w-4xl mx-auto my-14 px-4 md:px-0">
            <h1 className="font-bold text-2xl  ">MY LEARNING</h1>
            <div className="my-5 ">
              { 
              isLoading ? ( 
              <Skeleton />
            ) : mylearning.length === 0 ? (<p>you are not enrolled in any courses</p>) 
            : <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 ">
                {
                   mylearning.map((course,index)=>(<Course key={index} course={course}/>))
                }
            </div>
              
            }
            </div>
        </div>
    )
}

export default MyLearning;

const Skeleton = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {
                [...Array(3)].map((_, index) => (
                    <div
                        key={index}
                        className="bg-gray-300 dark:bg-gray-700 rounded-lg h-40 animate-pulse "
                    ></div>
                ))
            }
        </div>
    )
};