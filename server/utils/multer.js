import multer from "multer";

const fileFilter = (prefix, label) => (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith(prefix)) return cb(null, true);
  const error = new Error(`Only ${label} files are allowed`);
  error.code = "INVALID_FILE_TYPE";
  cb(error);
};

// Images (profile photo, course thumbnail): max 5 MB, images only.
export const uploadImage = multer({
  dest: "uploads",
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: fileFilter("image/", "image"),
});

// Lecture videos: max 500 MB, videos only.
export const uploadVideo = multer({
  dest: "uploads",
  limits: { fileSize: 500 * 1024 * 1024, files: 1 },
  fileFilter: fileFilter("video/", "video"),
});

export default uploadImage;
