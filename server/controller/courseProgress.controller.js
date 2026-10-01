import { CourseProgress } from "../model/courseprogress.model.js";
import Course from "../model/course.model.js";
import { CoursePurchase } from "../model/purchaseCourse.model.js";

export const getCourseProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.id;
        //step1:- fetching users course progress
        let courseProgress = await CourseProgress.findOne({ courseId, userId })
        const courseDetails = await Course.findById(courseId).populate("lectures");

        if (!courseDetails) {
            return res.status(404).json({
                message: "course not found"
            })
        }

        //step2:- if thereis not any progress found return course detail with empty course progress.
        if (!courseProgress) {
            return res.status(200).json({
                data: {
                    courseDetails,
                    progress: [],
                    completed: false
                },
            })
        }

        //step3:- return  the user course progress along with course  detail

        return res.status(200).json({
            data: {
                courseDetails,
                progress: courseProgress.lectureProgress,
                completed: courseProgress.completed
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


export const updateLectureProgress = async (req, res) => {
    try {
        const { courseId, lectureId } = req.params;
        const userId = req.id;

        // the lecture must belong to this course (stops faking progress with random ids)
        const course = await Course.findById(courseId);
        if (!course || !course.lectures.some((id) => String(id) === lectureId)) {
            return res.status(400).json({ message: "lecture does not belong to this course" });
        }

        //fetch or create course progress

        let courseProgress = await CourseProgress.findOne({ courseId, userId });

        if (!courseProgress) {
            // if no proress exit  create new progress record
            courseProgress = new CourseProgress({
                userId,
                courseId,
                completed: false,
                lectureProgress: []
            });
        }

        //  find the lecture progress in the course progress
        const lectureIndex = courseProgress.lectureProgress.findIndex((lecture) => lecture.lectureId === lectureId);
        if (lectureIndex !== -1) {
            //if lecture already exist then update status 
            courseProgress.lectureProgress[lectureIndex].viewed = true;
        } else {
            //add new lecture progress
            courseProgress.lectureProgress.push({
                lectureId,
                viewed: true,
            });
        }

        //if all lecture is complete

        const lectureProgressLength = courseProgress.lectureProgress.filter((lectureProg) => lectureProg.viewed).length;

        if (course.lectures.length === lectureProgressLength) courseProgress.completed = true;

        await courseProgress.save();

        return res.status(200).json({
            message: "lecture progress updated successfully"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const markAsCompleted = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.id;;

        const courseProgress = await CourseProgress.findOne({courseId, userId});
        if (!courseProgress) {
            return res.status(404).json({
                message: "course progress not found"
            })
        }

        const course = await Course.findById(courseId).select("lectures").lean();
        if (!course) return res.status(404).json({ message: "course not found" });
        const viewedIds = new Set(courseProgress.lectureProgress.filter((item) => item.viewed).map((item) => String(item.lectureId)));
        const allLecturesCompleted = course.lectures.length > 0 && course.lectures.every((lectureId) => viewedIds.has(String(lectureId)));
        if (!allLecturesCompleted) {
            return res.status(400).json({ message: "Watch all lectures before completing the course" });
        }
        courseProgress.completed = true;
        await courseProgress.save();
        return res.status(200).json({
            message: "Course marked as completed"
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}



export const markAsInCompleted = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.id;;

        const courseProgress = await CourseProgress.findOne({courseId, userId});
        if (!courseProgress) {
            return res.status(404).json({
                message: "course progress not found"
            })
        }

        courseProgress.lectureProgress.map((lectureProgress) => lectureProgress.viewed = false);
        courseProgress.completed = false;
        await courseProgress.save();
        return res.status(200).json({
            message: "Course marked as Incompleted"
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}