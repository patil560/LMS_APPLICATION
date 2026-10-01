import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useCreateCourseMutation } from "@/features/api/courseapi";
import { toast } from "sonner";

const AddCourse = () => {
    const items = [
        { label: "Web Development", value: "Web Development" },
        { label: "Next.js", value: "Next.js" },
        { label: "Javascript", value: "Javascript" },
        { label: "React.js", value: "React.js" },
        { label: "MongoDb", value: "MongoDb" },
    ]

    const [courseTitle, setCourseTitle] = useState("");
    const [category, setCategory] = useState('');

    const [createCourse, { data, isLoading, error, isSuccess }] = useCreateCourseMutation();

    const navigate = useNavigate();
    //const isLoading = false;

   const createCourseHandler = async () => {
  if (isLoading) return;

  try {
    const res = await createCourse({ courseTitle, category }).unwrap();
    toast.success(res?.message || "Course Created");
    navigate("/admin/course");
  } catch (error) {
    toast.error(error?.data?.message || "Failed to create course");
  }
};


    const getSelectedCategory = (value) => {
        setCategory(value);
    }

    return (
        <div className="flex-1 mx-10 ">
            <div className="mb-4 ">
                <h1 className="font-bold text-xl">Lets add course , add some course details for your new course</h1>
                <p className="text-sm"> add courses below</p>
            </div>
            <div className="space-y-4">
                <div>
                    <Label>Title</Label>
                    <Input value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} type="text" name="course title" placeholder="Your Course Name" />
                </div>
                <div>
                    <Label>Category</Label>
                    <Select onValueChange={getSelectedCategory} items={items}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select a caegory" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {items.map((item) => (
                                    <SelectItem key={item.value} value={item.value}>
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => navigate("/admin/course")}>Back</Button>
                    <Button disabled={isLoading} onClick={createCourseHandler}>
                        {
                            isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Please Wait
                                </>
                            ) : "Create"
                        }
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default AddCourse;