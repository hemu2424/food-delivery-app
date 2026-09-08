import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.fieldname === "video";
    return {
      folder: "food-delivery",            
      resource_type: isVideo ? "video" : "image",
      allowed_formats: isVideo ? ["mp4", "webm"] : ["jpg", "jpeg", "png", "webp"],
    };
  },
});

function fileFilter(req, file, cb) {
  const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
  const allowedVideoTypes = ["video/mp4", "video/webm"];

  if (file.fieldname === "images" && allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else if (file.fieldname === "video" && allowedVideoTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type for field "${file.fieldname}": ${file.mimetype}`), false);
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export default upload;