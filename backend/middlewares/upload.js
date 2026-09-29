import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary-v2";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.fieldname === "video" || file.mimetype.startsWith("video/");
    return {
      folder: "food-delivery",
      resource_type: isVideo ? "video" : "image",
      allowed_formats: isVideo
        ? ["mp4", "webm", "mov", "mkv", "avi", "ogg", "3gp"]
        : ["jpg", "jpeg", "png", "webp", "gif", "avif"],
    };
  },
});

function fileFilter(req, file, cb) {
  const isImageField = file.fieldname === "images" || file.fieldname === "avatar";
  const isVideoField = file.fieldname === "video";

  const isImageMime = file.mimetype.startsWith("image/");
  const isVideoMime = file.mimetype.startsWith("video/");

  if (isImageField && isImageMime) {
    cb(null, true);
  } else if (isVideoField && isVideoMime) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type for field "${file.fieldname}": ${file.mimetype}`), false);
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

export default upload;