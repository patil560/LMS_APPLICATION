import mongoose from "mongoose";


const LectureProgressSchema = new mongoose.Schema({
    lectureId:{
        type:String,
    },
    viewed:{
        type:Boolean,
    }
});

const courseProgressSchema = new mongoose.Schema({
    userId:{type:String},
    courseId:{type:String},
    completed:{type:Boolean},
    lectureProgress:[LectureProgressSchema]
});


// progress is always looked up by userId + courseId
courseProgressSchema.index({ userId: 1, courseId: 1 });

export const CourseProgress = mongoose.model("CourseProgress",courseProgressSchema);


