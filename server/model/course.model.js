import mongoose from "mongoose";


const courseSchema = new mongoose.Schema({
    courseTitle:{
        type:String,
        required:true
    },
    subTitle:{
        type:String,
       
    },
    description:{
        type:String,
    },
    category:{
        type:String,
        required:true
    },
    courseLevel:{
        type:String,
        enum:["Beginner", "Medium", "Advanced"]
    },
    coursePrice:{
        type:Number,
    },
    courseThumbnail:{
        type:String,
    },
    enrolledStudents:[
       {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
       }
    ],
    lectures:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Lecture'
        }
    ],
    creator:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    isPublished:{
        type:Boolean,
        default:false
    },
    averageRating:{
        type:Number,
        default:0,
        min:0,
        max:5
    },
    ratingCount:{
        type:Number,
        default:0,
        min:0
    },

},{timestamps:true});


// published list and instructor course list are filtered by these fields
courseSchema.index({ isPublished: 1, createdAt: -1 }); // published list (newest first)
courseSchema.index({ isPublished: 1, category: 1 }); // category filter
courseSchema.index({ creator: 1, createdAt: -1 }); // instructor's own courses

const Course = await mongoose.model("Course",courseSchema);

export default Course