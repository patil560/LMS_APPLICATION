import React from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { CourseTab } from "./coursetab"
export const EditCourse = () =>{
   return(
    <div className="flex-1 mt-24">
        <div className="flex items-center justify-between mb-5">
            <h1 className="font-bold text-xl">Add Detail  Information Regarding course</h1>
            <Link to="lecture">
            <Button className="hover:text-blue-600" variant="link">Go to lectures Page</Button>
            </Link>
        </div>
        <CourseTab />
    </div>
   )
}