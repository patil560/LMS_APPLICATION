import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useGetCreatorCoursesQuery } from "@/features/api/courseapi";
import {  Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import Pagination from "@/components/Pagination.jsx";

const PAGE_SIZE = 10;

const CourseTable = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const { data, isLoading, isFetching } = useGetCreatorCoursesQuery({ page, limit: PAGE_SIZE });
    const courses = data?.courses;

    // after deleting the last course of a page, step back one page
    useEffect(() => {
        if (data && data.courses.length === 0 && page > 1) setPage(page - 1);
    }, [data, page]);

    if (isLoading) return <h1>Loading....</h1>

    return (

        <div className="">
            <Button className="p-5" onClick={() => navigate("/admin/course/create")}>Create a new course</Button>
            <Table>
                <TableCaption>A list of your recent Courses.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {courses?.map((course) => (

                        <TableRow key={course._id}>

                            <TableCell className="font-medium">{course?.coursePrice || "NA"}</TableCell>
                            <TableCell><Badge>{course?.isPublished ? "Published" : "Draft"}</Badge></TableCell>
                            <TableCell>{course.courseTitle}</TableCell>
                            <TableCell className="text-right"><Edit className="cursor-pointer inline" onClick={()=>navigate(`${course._id}`)}/></TableCell>
                        </TableRow>
                    ))}

                </TableBody>
            </Table>
            <Pagination pagination={data?.pagination} onPageChange={setPage} disabled={isFetching} />
        </div>
    )
}

export default CourseTable;
