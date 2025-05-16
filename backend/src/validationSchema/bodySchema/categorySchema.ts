import Joi from "joi";

export const createCategorySchema = Joi.object<{ name: string }>({
  name: Joi.string().required(),
});

export const updateCategorySchema = Joi.object<{ name?: string }>({
  name: Joi.string(),
});
