import { User } from "@/entity/User";
import { CloudinaryImageHandler } from "@/utils/imageHandler";
import "express";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      token?: {
        access: string;
        refresh: string;
      };
      cloudinary: CloudinaryImageHandler;
    }
  }
}
