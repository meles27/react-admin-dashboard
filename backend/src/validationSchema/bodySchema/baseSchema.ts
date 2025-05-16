import Joi from "joi";

export const attributeCreateSchema = Joi.object<
  Record<string, string | number | boolean>
>()
  .pattern(
    Joi.string(),
    Joi.alternatives().try(Joi.string(), Joi.number(), Joi.boolean())
  )
  .default({});

export const attributeUpdateSchema = Joi.object<
  Record<string, string | number | boolean>
>().pattern(
  Joi.string(),
  Joi.alternatives().try(Joi.string(), Joi.number(), Joi.boolean())
);
