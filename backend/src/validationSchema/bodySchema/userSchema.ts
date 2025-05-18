import { User, USER_ROLE } from "@/entity/User";
import Joi from "joi";

export const userCreateSchema = Joi.object<
  Pick<
    User,
    | "username"
    | "firstName"
    | "lastName"
    | "email"
    | "password"
    | "role"
    | "phone"
  > & { password1: string }
>({
  username: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  password1: Joi.string()
    .valid(Joi.ref("password"))
    .messages({
      "any.only": "Passwords do not match.",
      "any.required": "Confirm password is required.",
    })
    .required(),
  role: Joi.string()
    .valid(...Object.values(USER_ROLE))
    .required(),
  phone: Joi.string().required(),
});

export const userUpdateSchema = Joi.object<
  Pick<User, "firstName" | "lastName" | "email" | "phone" | "role">
>({
  firstName: Joi.string(),
  lastName: Joi.string(),
  email: Joi.string().email(),
  phone: Joi.string(),
  role: Joi.string().valid(...Object.values(USER_ROLE)),
});
