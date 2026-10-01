import React from "react";
import { Card, CardContent } from "../../components/ui/card.jsx";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar.jsx";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const Course = ({ course }) => {
  if (!course?._id) {
    return null;
  }

  //console.log(course);

  const creator = course.creator;

  // creator may be a populated object or only an ObjectId string
  const creatorName =
    typeof creator === "object"
      ? creator?.name
      : "Instructor";

  const creatorPhoto =
    typeof creator === "object"
      ? creator?.photoUrl || creator?.photourl
      : undefined;

  return (
    <Link to={`/course-detail/${course._id}`}>
      <Card className="overflow-hidden rounded-lg bg-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl dark:bg-gray-800">
        <div className="relative h-38 w-full">
          <img
            src={course.courseThumbnail || "/placeholder-course.jpg"}
            alt={course.courseTitle || "Course thumbnail"}
            className="h-38 w-full rounded-t-lg object-cover"
          />
        </div>

        <CardContent className="space-y-2 px-5 py-4">
          <h1 className="truncate text-lg font-bold hover:underline">
            {course.courseTitle || "Untitled course"}
          </h1>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={creatorPhoto || "https://github.com/shadcn.png"}
                  alt={creatorName}
                />

                <AvatarFallback>
                  {creatorName?.slice(0, 2).toUpperCase() || "IN"}
                </AvatarFallback>
              </Avatar>

              <h2 className="text-sm font-bold">
                {creatorName}
              </h2>
            </div>

            <Badge className="rounded-full bg-blue-600 px-3 py-3 text-xs text-white">
              {course.courseLevel || "Medium"}
            </Badge>
          </div>

          <div className="text-lg font-bold">
            {course.coursePrice !== null &&
            course.coursePrice !== undefined ? (
              <span>₹{course.coursePrice}</span>
            ) : (
              <span className="text-sm text-red-500">
                Price unavailable
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default Course;