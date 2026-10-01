import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs/promises";
dotenv.config({ quiet: true });

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_secret: process.env.API_SECRET,
    api_key: process.env.API_KEY,
});

export const uplaodMedia = async (file) => {
    try {
        const uploadResponse = await cloudinary.uploader.upload(file, {
            resource_type: "auto"
        });
        return uploadResponse;
    } catch (error) {
        console.log(error);
    } finally {
        // multer saved the file on disk only to hand it to Cloudinary; remove it
        fs.unlink(file).catch(() => {});
    }
}

// delete a temp file multer left in uploads/ (used when a request is rejected after the upload)
export const removeTempFile = (file) => {
  if (file?.path) fs.unlink(file.path).catch(() => {});
};

//delete 
export const deleteMediaFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

//delete video from clodinary
export const deleteVideoFromCloudinary = async(publicId) =>{
    try {
        await cloudinary.uploader.destroy(publicId,{resource_type:"video"})
    } catch (error) {
        console.log(error)
    }
}
