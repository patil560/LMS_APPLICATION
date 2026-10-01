import express from "express"
import { uploadVideo } from "../utils/multer.js"
import { uplaodMedia } from "../utils/cloudinary.js"
import isAuthenticated from "../middleware/isAuthenticated.js"
import { isInstructor } from "../middleware/access.js"
import { uploadLimiter } from "../middleware/rateLimiter.js"

const router = express.Router();

router.route("/upload-video").post(isAuthenticated, isInstructor, uploadLimiter, uploadVideo.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No video file received"
            })
        }
        const result = await uplaodMedia(req.file.path);
        if (!result) {
            return res.status(500).json({
                success: false,
                message: "Uploading file Error"
            })
        }
        res.status(200).json({
            success: true,
            message: "file uploaded successfully",
            data: result
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Uploading file Error"
        })
    }
});


export default router;
