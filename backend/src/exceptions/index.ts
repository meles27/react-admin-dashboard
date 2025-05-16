import formatJoiErrors from "@/utils/formatJoiErrors";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { JsonWebTokenError } from "jsonwebtoken";
import logger from "node-color-log";
import { FindOneOptions, QueryFailedError, Repository } from "typeorm";
import {
  AccountInactiveError,
  BadGatewayError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  GatewayTimeoutError,
  HttpError,
  InternalServerError,
  NotFoundError,
  ServiceUnavailableError,
  UnauthorizedError,
} from "./errorClasses";

enum DATABASE_ERROR_CODES {
  ERROR_DUPLICATION_VIOLATION = "23505",
}

export interface ApiErrorResponse {
  statusCode?: number;
  detail: string;
  errors?: unknown;
}

/**
 * Throws a NotFoundError if the entity is not found in the database.
 * Otherwise, return the entity.
 * @param {Repository<T>} repository - The repository to query.
 * @param {FindOptionsWhere<T> | FindOptionsWhere<T>[]} where - The where clause to query the entity.
 * @returns {Promise<T>} - The entity if found, otherwise throws a NotFoundError.
 */
export async function throwErrorIfNotFound<T>(
  repository: Repository<T>,
  options: FindOneOptions<T>,
  errorMessage?: string
): Promise<T> {
  const entity = await repository.findOne(options);
  if (!entity) {
    throw new NotFoundError(errorMessage);
  }
  return entity;
}
/**
 * Logs the error to the console and then passes the error to the next error-handling middleware
 * @param {Error} err - The error to be logged
 * @param {Request} req - The current request
 * @param {Response} res - The current response
 * @param {NextFunction} next - The next middleware in the stack
 */
export const logErrors = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.color("yellow").bgColor("blue").italic().log(err.stack);
  next(err);
};

/**
 * Handles errors by sending the appropriate error response to the client
 * @param {Error | QueryFailedError} err - The error to be sent
 * @param {Request} req - The current request
 * @param {Response} res - The current response
 * @param {NextFunction} next - The next middleware in the stack
 * @returns {void}
 */
export function errorHandler(
  err:
    | Error
    | QueryFailedError
    | Joi.ValidationError
    | NotFoundError
    | HttpError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  /**
   * remove files if there
   */
  // Fire all deletions in parallel, but don't wait for completion
  const deletePromises = req.cloudinary
    .getUploadedResults()
    .map((file) => req.cloudinary.deleteImage(file.public_id));

  // Optionally handle results later
  deletePromises.forEach((promise) =>
    promise
      .then(() => {
        console.log("Delete successful");
      })
      .catch((err) => console.error("Delete failed:", err))
  );

  // 400 - Bad Request from joi validation
  if (err instanceof Joi.ValidationError) {
    logger.color("yellow").log(err);
    res.status(400).json({
      statusCode: 400,
      detail: "Bad Request",
      errors: formatJoiErrors(err),
    } as ApiErrorResponse);
  }
  // 400 - Bad Request
  else if (err instanceof BadRequestError) {
    res.status(400).json({
      statusCode: err.statusCode,
      detail: err.message,
      errors: err.errors,
    } as ApiErrorResponse);
  }
  // 401 - Unauthorized
  else if (err instanceof UnauthorizedError) {
    res.status(401).json({
      statusCode: err.statusCode,
      detail: err.message,
      errors: err.errors,
    } as ApiErrorResponse);
  }
  // 403 - Forbidden
  else if (err instanceof ForbiddenError) {
    res.status(403).json({
      statusCode: err.statusCode,
      detail: err.message,
      errors: err.errors,
    } as ApiErrorResponse);
  }
  // 403 - not active user error
  else if (err instanceof AccountInactiveError) {
    res.status(403).json({
      statusCode: err.statusCode,
      detail: err.message,
      errors: err.errors,
    } as ApiErrorResponse);
  }
  // 404 - Not Found
  else if (err instanceof NotFoundError) {
    res.status(404).json({
      statusCode: err.statusCode,
      detail: err.message,
      errors: err.errors,
    } as ApiErrorResponse);
  }
  // 409 - Conflict
  else if (err instanceof ConflictError) {
    res.status(409).json({
      statusCode: err.statusCode,
      detail: err.message,
      errors: err.errors,
    } as ApiErrorResponse);
  }
  // 500 - Internal Server Error
  else if (err instanceof InternalServerError) {
    res.status(500).json({
      statusCode: err.statusCode,
      detail: err.message,
      errors: err.errors,
    } as ApiErrorResponse);
  }
  // 502 - Bad Gateway
  else if (err instanceof BadGatewayError) {
    res.status(502).json({
      statusCode: err.statusCode,
      detail: err.message,
      errors: err.errors,
    } as ApiErrorResponse);
  }
  // 503 - Service Unavailable
  else if (err instanceof ServiceUnavailableError) {
    res.status(503).json({
      statusCode: err.statusCode,
      detail: err.message,
      errors: err.errors,
    } as ApiErrorResponse);
  }
  // 504 - Gateway Timeout
  else if (err instanceof GatewayTimeoutError) {
    res.status(504).json({
      statusCode: err.statusCode,
      detail: err.message,
      errors: err.errors,
    } as ApiErrorResponse);
  }
  // handle for database level conflict 409
  else if (err instanceof QueryFailedError) {
    if (
      err.driverError.code === DATABASE_ERROR_CODES.ERROR_DUPLICATION_VIOLATION
    ) {
      res.status(509).json({
        statusCode: 409,
        detail: err.driverError?.detail || err.message,
      } as ApiErrorResponse);
    } else {
      res.status(500).json({ error: err.driverError.message });
    }
  } else if (err instanceof JsonWebTokenError) {
    res.status(401).json({
      statusCode: 401,
      detail: err.message,
    });
  } else {
    res.status(500).json({
      error: "unhandled error",
      detail: err.message,
    });
  }
}
