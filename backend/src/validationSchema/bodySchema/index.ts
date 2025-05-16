import Joi from "joi";

export const imageUploadSchema = Joi.object({
  mimetype: Joi.string()
    .valid("image/jpeg", "image/png", "image/gif")
    .required()
    .messages({
      "any.only": "Only JPEG, PNG, and GIF image formats are allowed.",
    }),
  size: Joi.number()
    .max(5 * 1024 * 1024)
    .required() // 5 MB limit
    .messages({
      "number.max": "Image size must be less than or equal to 5 MB.",
    }),
})
  .required()
  .messages({
    "object.base": "A file is required for upload.",
  });
