import mongoose from "mongoose";

const LectureSchema = new mongoose.Schema({
    lectureTitle:{
        type:String,
        required:true,
    },
    videoUrl:{
        type:String,

    },
    publicId:{type:String},
    isPreviewFree:{type:Boolean, default:false},
},{timestamps:true});

export const Lecture = mongoose.model("Lecture",LectureSchema);
