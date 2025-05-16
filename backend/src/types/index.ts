import { USER_ROLE } from "@/entity/User";
import jwt from "jsonwebtoken";

export interface CustomJwtPayload extends jwt.JwtPayload {
  id: string;
  username: string;
  active: boolean;
  role: USER_ROLE;
  image: string;
}

export interface UserJwtPayload {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  active: boolean;
  role: USER_ROLE;
  image: string;
}

export interface EmailJwtPayload {
  id?: string;
}

export interface PaginatedResponseIface<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
