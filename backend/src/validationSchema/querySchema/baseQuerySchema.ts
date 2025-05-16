import { Settings } from "@/settings";
import Joi from "joi";

export type BaseQuerySchema = {
  offset?: number;
  limit?: number;
};

export const baseQuerySchema = Joi.object<BaseQuerySchema>({
  offset: Joi.number().integer().min(0).default(0),
  limit: Joi.number().integer().min(1).default(Settings.REST_API.PAGE_SIZE), // Limit should be a positive integer
});
