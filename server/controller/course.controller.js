import Course from "../model/course.model.js";
import { Lecture } from "../model/lecture.model.js";
import User from "../model/user.model.js";
import { CourseProgress } from "../model/courseprogress.model.js";
import { CourseReview } from "../model/review.model.js";
import { Wishlist } from "../model/wishlist.model.js";
import { CoursePurchase } from "../model/purchaseCourse.model.js";
import { deleteMediaFromCloudinary, deleteVideoFromCloudinary, uplaodMedia, removeTempFile } from "../utils/cloudinary.js"
import { parsePagination, buildPageMeta } from "../utils/pagination.js";

const sameId = (a, b) => String(a) === String(b);

export const createCourse = async (req, res) => {
    try {
        const { courseTitle, category } = req.body;
        if (typeof courseTitle !== "string" || typeof category !== "string" || !courseTitle.trim() || !category.trim()) {
            return res.status(400).json({
                message: "coursetitle and category is required"
            })
        }
        if (courseTitle.length > 120) {
            return res.status(400).json({
                message: "course title must be 120 characters or less"
            })
        }

        const course = await Course.create({
            courseTitle: courseTitle.trim(),
            category: category.trim(),
            creator: req.id
        })
        return res.status(201).json({
            message: "course created",
            course,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to create course"
        })
    }
}


export const searchCourse = async (req, res) => {
  try {
    const {
      query = "",
      categories = "",
      sortByPrice = "",
    } = req.query;

    const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 10, maxLimit: 50 });

    // escape regex characters + cap the length, so user input can never break or slow the regex
    const searchText = String(query)
      .trim()
      .slice(0, 100)
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const categoryList =
      Array.isArray(categories)
        ? categories
        : String(categories)
            .split(",")
            .map((category) => category.trim())
            .filter(Boolean);

    const searchCriteria = {
      isPublished: true,
      $or: [
        { courseTitle: { $regex: searchText, $options: "i" } },
        { subTitle: { $regex: searchText, $options: "i" } },
        { category: { $regex: searchText, $options: "i" } },
      ],
    };

    if (categoryList.length > 0) {
      searchCriteria.category = { $in: categoryList };
    }

    // _id is the tie-breaker so pages never repeat or skip items
    const sortOptions = {};
    if (sortByPrice === "low") {
      sortOptions.coursePrice = 1;
    } else if (sortByPrice === "high") {
      sortOptions.coursePrice = -1;
    } else {
      sortOptions.createdAt = -1;
    }
    sortOptions._id = -1;

    const [courses, total] = await Promise.all([
      Course.find(searchCriteria)
        .populate({ path: "creator", select: "name photourl" })
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Course.countDocuments(searchCriteria),
    ]);

    return res.status(200).json({
      success: true,
      courses,
      pagination: buildPageMeta({ page, limit, total }),
    });
  } catch (error) {
    console.error("searchCourse error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to search courses",
    });
  }
};

export const getPublishedCourse = async(req,res)=>{
    try {
        const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 12, maxLimit: 50 });
        const filter = { isPublished: true };

        const [courses, total] = await Promise.all([
            Course.find(filter)
                .populate({path:"creator",select:"name photourl"})
                .sort({ createdAt: -1, _id: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Course.countDocuments(filter),
        ]);

        return res.status(200).json({
            courses,
            pagination: buildPageMeta({ page, limit, total }),
            message:"Courses get successfully"
        })
    } catch (error) {
        console.log(error)
         return res.status(500).json({
            message: "Failed to get published course"
        })
    }
}

export const getCreatorCourses = async (req, res) => {
    try {
        const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 10, maxLimit: 50 });
        const filter = { creator: req.id };

        const [courses, total] = await Promise.all([
            Course.find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit).lean(),
            Course.countDocuments(filter),
        ]);

        return res.status(200).json({
            message: "course is Availabel ",
            courses,
            pagination: buildPageMeta({ page, limit, total }),
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Failed to get Course'
        })
    }
}


export const editCourse = async (req, res) => {
    const thumbnail = req.file;
    try {
        const courseId = req.params.courseId;
        const { courseTitle, subTitle, description, category, courseLevel, coursePrice } = req.body;
        let course = await Course.findById(courseId);

        if (!course) {
            removeTempFile(thumbnail);
            return res.status(404).json({
                message: "course not found!"
            })
        }
        if (!sameId(course.creator, req.id)) {
            removeTempFile(thumbnail);
            return res.status(403).json({
                message: "You can only edit your own courses"
            })
        }

        let courseThumbnail;

        if (thumbnail) {
            //upload new thumbnail first, so a failed upload never loses the old one
            courseThumbnail = await uplaodMedia(thumbnail.path)
            if (!courseThumbnail) {
                return res.status(500).json({
                    message: "Thumbnail upload failed"
                })
            }
            if (course.courseThumbnail) {
                try {
                    const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
                    await deleteMediaFromCloudinary(publicId);//delete old image
                } catch (err) {
                    console.log(err);
                }
            }
        }


        const updateData = { courseTitle, subTitle, description, category, courseLevel, coursePrice, courseThumbnail: courseThumbnail?.secure_url }

        course = await Course.findByIdAndUpdate(courseId, updateData, { new: true });

        return res.status(200).json({
            message: "Course updated successfully",
            course,

        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to create course"
        })
    }
}




export const getCourseById = async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                message: "course not found"
            })
        }
        if (!sameId(course.creator, req.id)) {
            return res.status(403).json({
                message: "You can only view your own courses here"
            })
        }
        return res.status(200).json({
            message: "course Get successfully By courseId",
            course
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to get CourseGetById "
        })
    }
}


export const createLecture = async (req, res) => {
    try {

        const { lectureTitle } = req.body;
        const { courseId } = req.params;
        if (typeof lectureTitle !== "string" || !lectureTitle.trim() || !courseId) {
            return res.status(400).json({
                message: "lectureTitle and CourseId is required"
            })
        };

        // check the course (and its owner) BEFORE creating anything, so no orphan lectures are left behind
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                message: "Course not found"
            });
        }
        if (!sameId(course.creator, req.id)) {
            return res.status(403).json({
                message: "You can only add lectures to your own courses"
            });
        }

        const lecture = await Lecture.create({
            lectureTitle: lectureTitle.trim()
        })

        course.lectures.push(lecture._id);
        await course.save();

        return res.status(200).json({
            message: "Lecture created Succesfully",
            lecture
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "failed to create lecture "
        })
    }
}



export const getLecture = async (req, res) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findById(courseId).populate("lectures");

        if (!course) {
            return res.status(404).json({
                message: "Course not found",
            });
        }
        if (!sameId(course.creator, req.id)) {
            return res.status(403).json({
                message: "You can only view lectures of your own courses",
            });
        }

        return res.status(200).json({
            lectures: course.lectures,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to get lecture",
        });
    }
};

export const editLecture = async (req, res) => {
    try {
        const { lectureTitle, videoInfo, isPreviewFree } = req.body;
        const { courseId, lectureId } = req.params;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                message: "Course not found"
            });
        }
        if (!sameId(course.creator, req.id)) {
            return res.status(403).json({
                message: "You can only edit lectures of your own courses"
            });
        }
        // the lecture must really belong to this course (stops editing other instructors' lectures)
        if (!course.lectures.some((id) => sameId(id, lectureId))) {
            return res.status(404).json({
                message: "lecture not found in this course"
            });
        }

        const lecture = await Lecture.findById(lectureId);
        if (!lecture) {
            return res.status(404).json({
                message: "lecture not found"
            });
        }

        // Update lecture fields
        if (lectureTitle) lecture.lectureTitle = lectureTitle;
        if (videoInfo?.videoUrl) lecture.videoUrl = videoInfo.videoUrl;
        if (videoInfo?.publicId) lecture.publicId = videoInfo.publicId;
        if (isPreviewFree !== undefined) lecture.isPreviewFree = isPreviewFree;

        await lecture.save();

        return res.status(200).json({
            lecture,
            message: "Lecture Updated successfully"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "failed to update lecture"
        });
    }
};

// finds the course that contains this lecture AND belongs to the logged-in instructor
const findOwnedCourseByLecture = (lectureId, userId) =>
    Course.findOne({ lectures: lectureId, creator: userId });

export const removeLecture = async (req, res) => {
    try {
        const { lectureId } = req.params;

        const ownedCourse = await findOwnedCourseByLecture(lectureId, req.id);
        if (!ownedCourse) {
            return res.status(404).json({
                message: "lecture not found in your courses"
            });
        }

        // Delete lecture
        const lecture = await Lecture.findByIdAndDelete(lectureId);
        if (!lecture) {
            return res.status(404).json({
                message: "lecture not found!"
            });
        }

        // Delete the lecture video from cloudinary
        if (lecture.publicId) {
            await deleteVideoFromCloudinary(lecture.publicId);
        }

        // Remove lecture reference from the course
        await Course.updateOne(
            { _id: ownedCourse._id },
            { $pull: { lectures: lectureId } }
        );

        return res.status(200).json({
            message: "Lecture removed successfully"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Lecture Not removed error "
        });
    }
};


//populate the course filed means we are taking previous data in current editing field then we edit it

export const getLectureById = async (req, res) => {
    try {
        const { lectureId } = req.params;

        const ownedCourse = await findOwnedCourseByLecture(lectureId, req.id);
        if (!ownedCourse) {
            return res.status(404).json({
                message: 'Lecture not found'
            });
        }

        const lecture = await Lecture.findById(lectureId);
        if (!lecture) {
            return res.status(404).json({
                message: 'Lecture not found'
            });
        }

        return res.status(200).json({
            lecture
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "failed to get lecture"
        });
    }
};


export const togglePublishCourse = async(req,res)=>{
    try {
        const {courseId}  = req.params;
        const {publish} = req.query;//true or false value return
        const course = await Course.findById(courseId).populate("lectures");
        if (!course) {
            return res.status(404).json({
                message: 'Course not found'
            });
        }
        if (!sameId(course.creator?._id ?? course.creator, req.id)) {
            return res.status(403).json({
                message: "You can only publish your own courses"
            });
        }
        // a course without lectures must not go live
        if (publish === "true" && course.lectures.length === 0) {
            return res.status(400).json({
                message: "Add at least one lecture before publishing"
            });
        }

        //publish status Based on the query parameter

        course.isPublished = publish === "true"; // true for publish and false for the not publish
        await course.save();
        const statusMessage = course.isPublished ? "Published" : "Unpublished"
        return res.status(200).json({
            course,
            message:`course is ${statusMessage}`,

        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"failed to update status"
        })
    }
}



export const deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                message: "Course not found!"
            });
        }

        // only the instructor who created the course can delete it
        if (String(course.creator) !== String(req.id)) {
            return res.status(403).json({
                message: "You can only delete your own courses"
            });
        }

        // Cloudinary cleanup must never block deleting the course itself
        if (course.courseThumbnail) {
            try {
                const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
                await deleteMediaFromCloudinary(publicId);
            } catch (err) {
                console.log(err);
            }
        }

        const lectures = await Lecture.find({ _id: { $in: course.lectures } }).select("publicId");
        await Promise.all(
            lectures
                .filter((lecture) => lecture.publicId)
                .map((lecture) => deleteVideoFromCloudinary(lecture.publicId))
        );

        await Lecture.deleteMany({ _id: { $in: course.lectures } });

        // remove the course from every enrolled student's profile and drop their progress
        await User.updateMany(
            { enrolledCourses: course._id },
            { $pull: { enrolledCourses: course._id } }
        );
        await Promise.all([
            CourseProgress.deleteMany({ courseId: String(course._id) }),
            CourseReview.deleteMany({ courseId: course._id }),
            Wishlist.deleteMany({ courseId: course._id }),
            CoursePurchase.deleteMany({ courseId: course._id }),
        ]);

        await Course.findByIdAndDelete(courseId);

        return res.status(200).json({
            message: "Course deleted successfully"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to delete course"
        });
    }
};
