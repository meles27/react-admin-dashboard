import formatJoiErrors from "@/utils/formatJoiErrors";
import { NextFunction, Request, Response } from "express";
import { ObjectSchema } from "joi";

// Middleware for validation
export const validateQuery = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: true, // Return first validation error
      allowUnknown: true, // Ignore unknown keys in query
      stripUnknown: true, // Remove unknown keys from query
      convert: true, // Automatically convert types
    });
    if (error) {
      res.status(400).json(formatJoiErrors(error));
      return;
    }
    // Annotate validated and converted values
    req.query = value;
    next();
  };
};
