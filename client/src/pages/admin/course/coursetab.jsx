import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/components/richtexteditor"
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEditCourseMutation, useGetCourseByIdQuery, usePublishCourseMutation, useRemoveCourseMutation } from "@/features/api/courseapi"
import { toast } from "sonner";
//import { query } from "node_modules/axios/index.cjs";


// This component shows a form to edit a single course.
// It:
// 1. Reads courseId from the URL (via useParams)
// 2. Fetches course data using RTK Query (useGetCourseByIdQuery)
// 3. Fills the form with that data
// 4. Lets the user change fields and save using useEditCourseMutation.







export const CourseTab = () => {
    //const isPublished = true;
    //const isLoading = false;

    // Options for the category dropdown
    // Each item has a label (what user sees) and a value (what gets stored)
    const items = [
        { label: "Web Development", value: "Web Development" },
        { label: "Next.js", value: "Next.js" },
        { label: "Javascript", value: "Javascript" },
        { label: "React.js", value: "React.js" },
        { label: "MongoDb", value: "MongoDb" },
    ]

    // Local state for all form fields
    // These will be filled from the API response and updated as user types.

    const [input, setInput] = useState({
        courseTitle: "",
        subTitle: "",
        description: "",
        category: "",
        courseLevel: "",
        coursePrice: "",
        courseThumbnail: "",

    });


    // Get courseId from the URL, e.g. /admin/course/:courseId.
    const params = useParams();
    //console.log(params)
    const courseId = params.courseId;

    

    // Fetch course data from API using RTK Query
    // courseByIdData will contain something like: { course: { ...course fields... } }
    // courseByIdLoading is true while the request is in progress
    // isError is true if the request fails

    const { data: courseByIdData, isLoading: courseByIdLoading, isError ,refetch} =
        useGetCourseByIdQuery(courseId);

    const [publishCourse,{data:publishedData}] = usePublishCourseMutation();
    const [removeCourse, { isLoading: removeLoading }] = useRemoveCourseMutation();
   
    
    // Extract the course object from the response
    // This is the actual course data we will use to fill the form.
    const course = courseByIdData?.course;

    // Extract the course object from the response
    // This is the actual course data we will use to fill the form.

    
    useEffect(() => {
        if (!course) return;
        //console.log("Full course:", course);
        //console.log("courseLevel from API:", course.courseLevel);

        // Set all form fields from the course data
        // ?? "" means: if the field is null/undefined, use empty string instead.

        setInput({
            courseTitle: course.courseTitle ?? "",
            subTitle: course.subTitle ?? "",
            description: course.description ?? "",
            category: course.category ?? "",
            courseLevel: course.courseLevel ?? "",
            coursePrice: course.coursePrice ?? "",
            courseThumbnail: course.courseThumbnail ?? "",
        });
    }, [course, setInput]);



    // State to show a preview of the selected thumbnail image
    const [previewThumbnail, setPreviewThumbnail] = useState('');
   // Hook to navigate to other pages programmatically.
    const navigate = useNavigate();

    // RTK Query mutation to edit/update the course
    // editCourse is the function we call to send updated data
    // data, isLoading, isSuccess, error are used for UI + toasts.
    const [editCourse, { data, isLoading, isSuccess, error }] = useEditCourseMutation();

    // Generic handler for text/number inputs (title, subtitle, price, etc.)
    // e.target.name tells which field changed, e.target.value is the new value.
    //get input value
    const changeEventHandler = (e) => {
        const { name, value } = e.target;
        setInput({ ...input, [name]: value });
    }
    
    // Handler for category Select dropdown
    // value is the selected category from the dropdown.
    //get category
    const selectcategory = (value) => {
        setInput({ ...input, category: value })
    }

    //get course level
    const selectCourseLevel = (value) => {
        setInput({ ...input, courseLevel: value })
    }

    // Handler for file input (course thumbnail)
    // When user selects a file, we:
    // 1. Store the file object in input.courseThumbnail (to send to backend)
    // 2. Create a preview URL to show the image on the page
    //get file

    const selectThumbnail = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setInput({ ...input, courseThumbnail: file })
            const fileReader = new FileReader()
            fileReader.onloadend = () => setPreviewThumbnail(fileReader.result);
            fileReader.readAsDataURL(file);
        }
    }

    // Called when "Save" button is clicked
    // Builds FormData and sends it to the backend via editCourse mutation.
    //update course

    const updateCourseHandler = async () => {
        //console.log(input)
        // Create FormData object (required for file uploads).
        const formData = new FormData();

        // Append all fields to FormData (needed for file upload.)
        formData.append("courseTitle", input.courseTitle);
        formData.append("subTitle", input.subTitle);
        formData.append("description", input.description);
        formData.append("category", input.category);
        formData.append("courseLevel", input.courseLevel);
        formData.append("coursePrice", input.coursePrice);
        formData.append("courseThumbnail", input.courseThumbnail);
        //console.log(formData.get("courseTitle"));        
         // Send updated data + courseId to the API.
        await editCourse({ formData, courseId })//sending data to course api

    }

    const removeCourseHandler = async () => {
        const ok = window.confirm(
            "Delete this course permanently? All its lectures will be deleted and it will be removed from enrolled students' profiles."
        );
        if (!ok) return;
        try {
            const res = await removeCourse(courseId).unwrap();
            toast.success(res?.message || "Course deleted successfully");
            navigate("/admin/course");
        } catch (err) {
            toast.error(err?.data?.message || "Failed to delete course");
        }
    }

    const publishStatusHandler = async(action) =>{
        try {
            const response = await publishCourse({courseId,query:action});
           // console.log(publishedData)
            if(response.data){
                refetch();
                toast.success(response?.data.message || " publish successfully")
            }
        } catch (error) {
            console.log(error)
            toast.error("Failed to publish or unpublish course")
        }
    }


     // Show toast notifications when the update succeeds or fails
    // This runs whenever isSuccess or error changes

    useEffect(() => {
        if (isSuccess) {
            toast.success(data?.message || "course updated")
        }
        if (error) {
            toast.error(error.data?.message || "failed to update")
        }
    }, [isSuccess, error])
   
    return (
        <Card>
            <CardHeader className="flex flex-row justify-between  ">
                <div>
                    <CardTitle>Basic Course Information</CardTitle>
                    <CardDescription>
                        Make changes to your course here , Click save when you're done.
                    </CardDescription>

                </div>
                <div className="flex gap-2">
                    <Button disabled={courseByIdData?.course.lectures.length === 0} variant="outline" onClick={()=>publishStatusHandler(courseByIdData?.course.isPublished ? "false" : "true")}>
                        {
                            courseByIdData?.course.isPublished ? "Unpublish" : "Publish"
                        }
                    </Button>
                    <Button variant="destructive" disabled={removeLoading} onClick={removeCourseHandler}>
                        {
                            removeLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Please Wait
                                </>
                            ) : "Remove Course"
                        }
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 mt-5">
                    <div>
                        <Label>Title</Label>
                        <Input
                            type="text"
                            value={input.courseTitle}
                            placeholder="Ex. Full-Stack Developer"
                            name="courseTitle"
                            onChange={changeEventHandler}
                        />
                    </div>
                    <div>
                        <Label> Subtitle</Label>
                        <Input
                            type="text"
                            value={input.subTitle}
                            placeholder="Ex. Become a Full-Stack Developer from Zero To hero in 2 Months."
                            name="subTitle"
                            onChange={changeEventHandler}
                        />
                    </div>
                    <div>
                        <Label> Description</Label>
                        <RichTextEditor input={input} setInput={setInput} />
                    </div>
                    <div className="flex items-center gap-5">
                        <div>
                            <Label>Category</Label>
                            <Select value={input.category} onValueChange={selectcategory}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select a category" />
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
                        <div>
                            <Label>Course Level</Label>
                            <Select value={input.courseLevel} onValueChange={selectCourseLevel}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select a course level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="Beginner">Beginner</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="Advanced">Advanced</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Price in (INR)</Label>
                            <Input
                                type="number"
                                name="coursePrice"
                                value={input.coursePrice}
                                onChange={changeEventHandler}
                                placeholder="199"
                                className="w-fit"
                            />
                        </div>

                    </div>
                    <div>
                        <Label>Course Thumbnail</Label>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={selectThumbnail}
                            className="w-fit"
                        />
                        {
                            //if url get then show thumbnail on page
                            previewThumbnail && (
                                <img src={previewThumbnail} className="w-64 my-2" alt="course thumbnail" />
                            )
                        }
                    </div>
                    <div>
                        <Button onClick={() => navigate("/admin/course")} variant="outline">cancel</Button>
                        <Button disabled={isLoading} onClick={updateCourseHandler}>
                            {
                                isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Please Wait
                                    </>
                                ) : "save"
                            }
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}



/**
 * CourseTab – Edit Course Form
 *
 * PURPOSE:
 * This component shows a form to edit a single course.
 *
 * FLOW:
 * 1. Reads `courseId` from the URL using useParams (e.g. /admin/course/:courseId/edit).
 * 2. Fetches course data using RTK Query: useGetCourseByIdQuery(courseId).
 * 3. When data arrives, fills the form fields (input state).
 * 4. User can change fields and click "Save".
 * 5. On save, sends FormData with all fields + courseId to the backend via
 *    useEditCourseMutation({ formData, courseId }).
 *
 * EXPECTED API RESPONSE SHAPE (for useGetCourseByIdQuery):
 * ---------------------------------------------------------
 * The hook expects the response to look like this:
 *
 * {
 *   course: {
 *     courseTitle: string,          // e.g. "Full-Stack Developer"
 *     subTitle: string,             // e.g. "Become a Full-Stack Developer..."
 *     description: string,          // HTML or plain text from rich text editor
 *     category: string,             // e.g. "Web Development", "React.js", etc.
 *     courseLevel: string,          // MUST be one of: "Beginner" | "Medium" | "Advanced"
 *     coursePrice: string | number, // e.g. 199 or "199"
 *     courseThumbnail: string       // URL of the thumbnail image (if already saved)
 *   }
 * }
 *
 * NOTES:
 * - If any field is missing/null/undefined, this component uses "" (empty string) as fallback.
 * - courseLevel MUST exactly match one of the SelectItem values:
 *     "Beginner", "Medium", or "Advanced"
 *   Otherwise, the dropdown will show the placeholder instead of the saved value.
 * - category values should match what your backend expects and what you have in `items`.
 *
 * EDIT COURSE (useEditCourseMutation) PAYLOAD:
 * --------------------------------------------
 * Sends FormData with:
 * - courseTitle: string
 * - subTitle: string
 * - description: string
 * - category: string
 * - courseLevel: string
 * - coursePrice: string
 * - courseThumbnail: File (image file) or existing URL string
 */