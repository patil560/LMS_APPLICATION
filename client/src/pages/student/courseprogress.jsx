import { Button } from "@/components/ui/button";
import React from "react"
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { CheckCircle2, CirclePlay } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useGetCourseProgressQuery, useUpdateLectureProgressMutation, useCompleteCourseMutation, useInCompleteCourseMutation } from "@/features/api/courseprogressapi";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner"
import Certificate from "./Certificate.jsx";
import { useSelector } from "react-redux";

const CourseProgress = () => {

    const params = useParams();
    const user = useSelector((state) => state.auth.user);
    const courseId = params.courseId;

    const { data, isLoading, isError, refetch } = useGetCourseProgressQuery(courseId);

    const [updateLectureProgress] = useUpdateLectureProgressMutation();

    const [completeCourse] = useCompleteCourseMutation();
    const [inCompleteCourse] = useInCompleteCourseMutation()

    const [currentLecture, setCurrentLecture] = useState(null);



    if (isLoading) return <p>Loading...</p>
    if (isError) return <p>Failed to load course details</p>
    //console.log(data);
    const { courseDetails, progress, completed } = data.data;

    const { courseTitle } = courseDetails;

    // initilize the first lecture is not exist

    const initialLecture = currentLecture || courseDetails.lectures && courseDetails.lectures[0];


    const isLectureCompleted = (lectureId) => {
        return progress.some((prog) => prog.lectureId === lectureId && prog.viewed)
    }
    //selct specific lecture to watch

    const handleSelectLecture = (lecture) => {
        setCurrentLecture(lecture)
    }

    const handleLectureProgress = async (lectureId) => {
        await updateLectureProgress({ courseId, lectureId });
        refetch();
    }

    const handleCompleteCourse = async () => {
        try {
            const response = await completeCourse(courseId).unwrap();

            toast.success(response.message);
            refetch();
        } catch (error) {
            toast.error(
                error?.data?.message || "Failed to mark course as completed"
            );
        }
    };

    const handleInCompleteCourse = async () => {
        try {
            const response = await inCompleteCourse(courseId).unwrap();

            toast.success(response.message);
            refetch();
        } catch (error) {
            toast.error(
                error?.data?.message || "Failed to mark course as incomplete"
            );
        }
    };


    return (
        <div className="max-w-7xl mx-auto p-4 mt-10">
            {/* Display Course Name */}
            <div className="flex justify-between mb-4 ">
                <h1 className="text-2xl font-bold">{courseTitle}</h1>
                <Button variant={completed ? "outline" : "default"} onClick={completed ? handleInCompleteCourse : handleCompleteCourse}>
                    {
                        completed ? <div className="flex items:center "><CheckCircle2 className="h-4 w-4 mr-2" /><span>Completed</span></div> : "mark as completed"
                    }
                </Button>
            </div>

            {completed && (
                <div className="mb-8">
                    <Certificate courseTitle={courseTitle} userName={user?.name || "Student"} />
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-6">
                {/* Video section */}
                <div className="flex-1 md:w-3/5 rounded-lg h-fit shadow-lg p-4">
                    <div>
                        {/* Video comes here*/}

                        <video
                            src={(currentLecture?.videoUrl || initialLecture?.videoUrl)?.replace(/^http:/, "https:")}
                            controls
                            className="w-full h-auto md:rounded-lg "
                            onPlay={() => {
                                const id = currentLecture?._id || initialLecture?._id;
                                if (id && !isLectureCompleted(id)) handleLectureProgress(id);
                            }}
                        />
                    </div>

                    {/* Display current watching lecture Title */}

                    <div className="mt-2 ">
                        <h3 className="font-medium text-lg">
                            {
                                `Lecture ${courseDetails.lectures.findIndex((lecture) => lecture._id === (currentLecture?._id || initialLecture?._id)) + 1} : ${currentLecture?.lectureTitle || initialLecture?.lectureTitle} `
                            }

                        </h3>
                    </div>
                </div>
                {/* Lecture Sidebar     */}
                <div className="flex flex-col w-full md:w-2/5 border-t md:border-t-0 md:border-l border-gray-200 md:pl-4 md:pt-8">
                    <h2 className="font-semibold text-xl mb-4">Course Lecture</h2>
                    <div className="flex-1 overflow-y-auto">
                        {
                            courseDetails?.lectures.map((lecture, index) => (
                                <Card
                                    onClick={() => handleSelectLecture(lecture)}
                                    key={lecture._id}
                                    className={`mb-3 hover:cursor-pointer transition transform ${lecture._id === currentLecture?._id ? "bg-gray-200 dark:bg-gray-800" : ' '}`}
                                >
                                    <CardContent className="flex items-center justify-between p-4">
                                        <div className="flex items-center">
                                            {
                                                isLectureCompleted(lecture._id) ? (
                                                    <CheckCircle2 size={24} className="text-green-500 mr-2 " />
                                                ) : (
                                                    <CirclePlay size={24} className="text-gray-500 mr-2 " />
                                                )}
                                            <div>
                                                <CardTitle className='text-lg font-medium'>{lecture.lectureTitle}</CardTitle>
                                            </div>
                                        </div>
                                        {
                                            isLectureCompleted(lecture._id) && (
                                                <Badge variant='outline' className="bg-green-200 text-green-600 ">Completed</Badge>
                                            )
                                        }
                                    </CardContent>
                                </Card>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>

    )
}


export default CourseProgress;