// middleware/cloudinaryMiddleware.ts
import { CloudinaryImageHandler } from "@/utils/imageHandler";
import { NextFunction, Request, Response } from "express";

export const injectCloudinary = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  req.cloudinary = new CloudinaryImageHandler();
  next();
};
