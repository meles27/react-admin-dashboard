import { Settings } from "@/settings";
import fs from "fs";
import logger from "node-color-log";
import path from "path";

export const removeFile = (
  filename: string,
  basedir: string = Settings.STATICFILE_DIR
) => {
  if (filename) {
    const fullPath = path.join(basedir, path.basename(filename));
    console.log("the current full path is ", fullPath);
    try {
      if (fs.existsSync(fullPath)) {
        console.log("file exists");
        fs.unlinkSync(fullPath); // Synchronous deletion
      } else {
        console.log("file does not exist");
      }
    } catch (err) {
      console.error(`Error deleting file at ${fullPath}:`, err);
    }
  }
};

export const saveFileRelativePath = (filename: string) => {
  const fullPath = path.join(Settings.STATICFILE_DIR, filename);
  logger.color("yellow").log("full path", fullPath);
  return path
    .join(Settings.STATIC_URL, path.relative(Settings.STATICFILE_DIR, fullPath))
    .replace(/\\/g, "/");
};
