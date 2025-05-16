import { USER_ROLE } from "@/entity/User";
import Joi from "joi";
import { baseQuerySchema } from "./baseQuerySchema";

export type UserQuerySchema = {
  search?: string;
  active?: boolean;
  role?: USER_ROLE;
  includeDeleted?: boolean;
};

export const userQuerySchema = baseQuerySchema.append<UserQuerySchema>({
  search: Joi.string().allow(""),
  active: Joi.boolean(),
  includeDeleted: Joi.boolean(),
  role: Joi.string().valid(...Object.values(USER_ROLE)),
});
