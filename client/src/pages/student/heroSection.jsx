import { Button } from "@base-ui/react";
import React, { useState } from "react"
import { useNavigate } from "react-router-dom";

const heroSection = () => {
    const [searchQuery ,setSearchQuery] = useState("");
    const navigate = useNavigate();
    const searchHandler = (e)=>{
        e.preventDefault();
        //alert(searchQuery);
        if(searchQuery.trim() !== ""){
            navigate(`/course/search?query=${encodeURIComponent(searchQuery)}`)
        }
        

    }
     
  
    return (
        <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-gray-800 dark:to-gray-900 py-20 px-4 text-center ">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-white text-4xl font-bold mb-4">Find The Best Courses for you</h1>
                <p className="text-gray-200 dark:text-gray-400 mb-8">Discover, Learn, And Upskill With Our Wide Range Of Courses </p>


                <form className="flex overflow-hidden max-w-xl mx-auto mb-6 items-cente bg-white dark:bg-gray-800 rounded-full shadow-lg " onSubmit={searchHandler}>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e)=>setSearchQuery(e.target.value)}
                        placeholder="Search"
                        className="flex-grow border-none focus-visible:ring-0 px-6 py-3 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    />
                    <Button type="submit" className="dark:bg-gray-700 bg-blue-600  text-white px-6 py-3 rounded-r-full hover:bg-blue-700 dark:hover:bg-blue-800">Search</Button>
                    
                </form>
                <Button onClick={()=>navigate(`/course/search?query`)} className="px-4 py-3 bg-white dark:gray-800 text-blue-600 rounded-full hover:bg-gray-200 " >Explore courses </Button>
            </div>
        </div>
    )

}

export default heroSection;