import Joi from "joi";
import { baseQuerySchema } from "./baseQuerySchema";

export type CategoryQuerySchema = {
  search?: string;
};

export const categoryQuerySchema = baseQuerySchema.append<CategoryQuerySchema>({
  search: Joi.string().allow(""),
});
