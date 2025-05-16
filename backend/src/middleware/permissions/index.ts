import { USER_ROLE } from "@/entity/User";
import {
  AccountInactiveError,
  ForbiddenError,
  UnauthorizedError,
} from "@/exceptions/errorClasses";
import { NextFunction, Request, Response } from "express";

/**
 * A middleware that checks if the user is authenticated and has the given role.
 * If the user is authenticated and has the given role, it calls the next middleware.
 * If the user is not authenticated or does not have the given role, it returns a 401 status with a JSON object containing the error message.
 * @param {USER_ROLE} role - The role to check for.
 * @returns {(req: Request, res: Response, next: NextFunction) => void} - The middleware function.
 */
export const isAllowedTo =
  (
    role: USER_ROLE | USER_ROLE[]
  ): ((req: Request, res: Response, next: NextFunction) => void) =>
  (req: Request, res: Response, next: NextFunction) => {
    /**
     * user is not authenticated
     */
    if (!req.user) {
      throw new UnauthorizedError();
    }
    /**
     * user is authenticated but not active
     */
    if (req.user) {
      if (!req.user?.active) {
        throw new AccountInactiveError();
      }
    }

    if (role instanceof Array && role.includes(req.user.role)) {
      /**
       * allow if the user is authenticated and has one of the given roles
       */
      return next();
    } else if (role instanceof Array && !role.length) {
      /**
       * allow if user is authenticated, doesn't matter the role
       */
      return next();
    } else if (role instanceof String && role === req.user.role) {
      /**
       * allow to the authenticated user
       */
      return next();
    } else {
      /**
       * user is authenticated but doesn't have permission
       */
      throw new ForbiddenError();
    }
  };

/**
 * A middleware that checks if the user is authenticated.
 * If the user is authenticated, it calls the next middleware.
 * If the user is not authenticated, it returns a 401 status with a JSON object containing the error message.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function in the Express router.
 */
export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user) {
    if (!req.user?.active) {
      throw new AccountInactiveError();
    } else {
      next();
    }
  } else {
    throw new UnauthorizedError();
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role === USER_ROLE.ADMIN) {
    next();
  } else {
    throw new ForbiddenError();
  }
};
