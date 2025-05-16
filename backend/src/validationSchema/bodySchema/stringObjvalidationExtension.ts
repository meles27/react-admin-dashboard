import Joi from "joi";
import logger from "node-color-log";

// Custom extension function
export const parseJson = <T>(schema: Joi.ObjectSchema<T>): Joi.StringSchema => {
  return Joi.string().custom((value, helpers) => {
    try {
      logger.color("yellow").log("the current value is ", value);

      const parsedValue = JSON.parse(value);
      const validationResult = schema.validate(parsedValue);
      if (validationResult.error) {
        throw validationResult.error;
      }
      return parsedValue as T;
    } catch (error) {
      return helpers.error(
        'string "value" must be a valid JSON object ' + JSON.stringify(value)
      );
    }
  });
};
