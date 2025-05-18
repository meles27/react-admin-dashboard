import { Settings } from "@/settings";
import multer from "multer";
import path from "path";

// Set up storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, Settings.STATICFILE_DIR); // Set uploads directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const parsed = path.parse(file.originalname);
    const fullPath = parsed.name + "-" + uniqueSuffix + parsed.ext;
    cb(null, fullPath);
  },
});

// Set file filter
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true); // Accept file
  } else {
    cb(new Error("Only image files are allowed!"));
  }
};

// Configure multer upload
const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Limit to 5MB
  fileFilter,
});

export default upload;
