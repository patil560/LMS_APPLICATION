import mongoose from "mongoose";

const coursePurchaseSchema = new mongoose.Schema({
    courseId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
        required:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        enum:['pending','completed',"failed"],
        default:"pending",
    },
    paymentId:{
        type:String,
        required:true
    }
},{timestamps:true});

// speeds up: purchase-status lookup (userId+courseId+status) and webhook/verify lookup (paymentId)
coursePurchaseSchema.index({ userId: 1, courseId: 1, status: 1 });
coursePurchaseSchema.index({ paymentId: 1 });

export const CoursePurchase = mongoose.model("CoursePurchase",coursePurchaseSchema);
