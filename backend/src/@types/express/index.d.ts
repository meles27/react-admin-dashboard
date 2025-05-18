import { User } from "@/entity/User";
import "express";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      token?: {
        access: string;
        refresh: string;
      };
    }
  }
}
