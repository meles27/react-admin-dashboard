import Joi from "joi";

type ConfirmResetPasswordType = {
  password: string;
  password1: string;
  token: string;
};
/**
 * login schema
 */
export const loginSchema = Joi.object<{
  username: string;
  password: string;
}>({
  username: Joi.string().min(3).max(10).required().messages({
    "string.base": '"username" should be a type of "text"',
    "string.empty": '"username" cannot be empty',
    "string.min": '"username" should have a minimum length of {#limit}',
    "string.max": '"username" should have a maximum length of {#limit}',
    "any.required": '"username" is a required field',
  }),
  password: Joi.string().min(6).max(100).required().messages({
    "string.base": '"password" should be a type of "text"',
    "string.empty": '"password" cannot be empty',
    "string.min": '"password" should have a minimum length of {#limit}',
    "string.max": '"password" should have a maximum length of {#limit}',
    "any.required": '"password" is a required field',
  }),
});
/**
 * refresh jwt token
 */
export const refreshTokenSchema = Joi.object<{
  refresh: string;
}>({
  refresh: Joi.string().required(),
});
/**
 * request forget password
 */
export const forgetPasswordSchema = Joi.object<{ username: string }>({
  username: Joi.string().required(),
});
/**
 * confirm forget password
 */
export const confirmForgetPasswordSchema = Joi.object<ConfirmResetPasswordType>(
  {
    token: Joi.string().required(),
    password: Joi.string().required().min(6),
    password1: Joi.string()
      .valid(Joi.ref("password"))
      .messages({
        "any.only": "Passwords do not match.",
        "any.required": "Confirm password is required.",
      })
      .required(),
  }
);
