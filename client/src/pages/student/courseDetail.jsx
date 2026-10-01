import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeInfo, Lock, PlayCircle } from "lucide-react";
import React from "react";
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button";
import BuyCourseButton from "@/components/BuyCourseButton";
import { useNavigate, useParams } from "react-router-dom";
import { useGetCoursedetailWithStatusQuery } from "@/features/api/purchaseapi";
import ReviewSection from "@/components/ReviewSection.jsx";
import { Heart, Star } from "lucide-react";
import { useGetWishlistStatusQuery, useAddToWishlistMutation, useRemoveFromWishlistMutation } from "@/features/api/wishlistapi.js";
import { useSelector } from "react-redux";
import { toast } from "sonner";

const CourseDetail = () => {
    const params = useParams();
    const courseId = params.courseId;
    //console.log(courseId);
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);
    const { data: wishlistStatus } = useGetWishlistStatusQuery(courseId);
    const [addToWishlist] = useAddToWishlistMutation();
    const [removeFromWishlist] = useRemoveFromWishlistMutation();
    const { data, isLoading, isError } = useGetCoursedetailWithStatusQuery(courseId);

    if (isLoading) return <h1>Loadin...</h1>

    if (isError) return <h1>Failed to load course Details</h1>

    const { course, purchased } = data;
    // the server only sends videos of free-preview lectures to visitors who have not bought the course
    const previewLecture = course?.lectures?.find((lecture) => lecture.videoUrl);

    const toggleWishlist = async () => {
        try {
            if (wishlistStatus?.wishlisted) await removeFromWishlist(courseId).unwrap();
            else await addToWishlist(courseId).unwrap();
            toast.success(wishlistStatus?.wishlisted ? "Removed from wishlist" : "Added to wishlist");
        } catch (error) {
            toast.error(error?.data?.message || "Unable to update wishlist");
        }
    };

    const handleContioueCourse = () =>{
        if(purchased){
           navigate(`/course-progress/${courseId}`)
        }
    }
    //console.log(purchased)

    //const purschasedCourse = false;
    return (

        <div className="mt-10 space-y-5">
            <div className="bg-[#2D2F31] text-white  ">
                <div className="max-w-7xl mx-auto py-8 px-4 dark:px-8 flex flex-col gap-2">
                    <h1 className="font-bold text-2xl md:text-3xl">{course?.courseTitle}</h1>
                    <p className="text-base md:text-lg"> {course?.subTitle}</p>
                    <p >Created By {""} <span className="text-[#C0C4FC] underline italic">{course?.creator?.name}</span></p>
                    <div className="flex items-center gap-2 text-sm">
                        <BadgeInfo size={16} />
                        <p>{course?.createdAt.split("T")[0]}</p>
                    </div>
                    <p>Student Enrolled : {course?.enrolledStudents.length} </p>
                    <div className="flex items-center gap-2"><Star className="h-4 w-4 fill-current" /> {course?.averageRating || 0} ({course?.ratingCount || 0} reviews)</div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto my-5 px-4 md:px-8 flex flex-col lg:flex-row md:flex-row justify-between gap-10">
                <div className="w-full lg:w-1/2 space-y-5">
                    <h1 className="font-bold text-xl md:2xl ">Description</h1>
                    <p className="text-sm" dangerouslySetInnerHTML={{ __html: course?.description }} />


                    <Card>
                        <CardHeader>
                            <CardTitle>Course Content</CardTitle>
                            <CardDescription>
                                {course?.lectures?.length ?? 0} lectures
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {
                                course?.lectures.map((lecture, index) => (
                                    <div key={index} className="flex items-center gap-3 text-sm mb-3">
                                        <span>
                                            {
                                                purchased || lecture?.isPreviewFree ? (<PlayCircle size={14} />) : <Lock size={14} />
                                            }
                                        </span>
                                        <p>{lecture?.lectureTitle}</p>
                                    </div>
                                ))
                            }
                        </CardContent>
                    </Card>
                </div>
                <div className="w-full lg:w-1/3">
                    <Card>
                        <CardContent className="p-4 flex  flex-col">
                            <div className="w-full aspect-video mb-4 justify-center">
                                {/* here i was trying to use react player but it is not working so i used <video /> tag */}
                                {previewLecture ? (
                                    <video
                                        src={previewLecture.videoUrl.replace(/^http:/, "https:")}
                                        controls
                                        width="100%"
                                        height="100%"
                                        muted={false}
                                        onError={(e) => {
                                            console.error("Video error:", e.currentTarget.error);
                                        }}
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center rounded bg-gray-200 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                        <Lock size={18} className="mr-2" /> Purchase the course to unlock the lectures
                                    </div>
                                )}
                            </div>
                            <h1>{previewLecture?.lectureTitle}</h1>
                            <Separator className="my-2" />
                            <h1 className="text-lg md:text-xl font-semibold">Course Price: {course?.coursePrice != null ? `₹${course.coursePrice}` : "N/A"}</h1>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-2 justify-center">
                            {user && <Button variant="outline" onClick={toggleWishlist} className="w-full"><Heart className={wishlistStatus?.wishlisted ? "mr-2 fill-current" : "mr-2"} /> {wishlistStatus?.wishlisted ? "Remove from wishlist" : "Add to wishlist"}</Button>}

                            {
                                purchased ? (
                                    <Button onClick={handleContioueCourse} className="w-full">Continue course</Button>
                                )
                                    : (
                                        <BuyCourseButton courseId={courseId} />
                                    )
                            }

                        </CardFooter>
                    </Card>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 md:px-8 pb-10">
                <ReviewSection courseId={courseId} canReview={Boolean(purchased && !data?.isOwner)} />
            </div>
        </div>

    )
}

export default CourseDetail;