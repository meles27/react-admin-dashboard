import { AppDataSource } from "@/data-source";
import { ResetToken } from "@/entity/ResetToken";
import { User } from "@/entity/User";
import { throwErrorIfNotFound } from "@/exceptions";
import {
  AccountInactiveError,
  UnauthorizedError,
  ValidationError,
} from "@/exceptions/errorClasses";
import { EmailJwtPayload, UserJwtPayload } from "@/types";
import { Auth } from "@/utils/auth";
import { Password } from "@/utils/password";
import {
  confirmForgetPasswordSchema,
  forgetPasswordSchema,
  loginSchema,
  refreshTokenSchema,
} from "@/validationSchema/bodySchema/authSchema";
import { NextFunction, Request, RequestHandler, Response } from "express";
import logger from "node-color-log";

export namespace AuthControllers {
  export const jwtToken: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    // validate password and username
    const validatedData = await loginSchema.validateAsync(req.body);
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      select: [
        "id",
        "username",
        "password",
        "active",
        "role",
        "image",
        "firstName",
        "lastName",
      ],
      where: { username: validatedData.username },
    });

    if (
      user &&
      Password.comparePassword(validatedData.password, user.password)
    ) {
      if (!user.active) {
        throw new AccountInactiveError();
      }
      res.status(200).json({
        access: Auth.generateAccessToken<UserJwtPayload>({
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          active: user.active,
          role: user.role,
          image: user.image,
        }),
        refresh: Auth.generateRefreshToken<UserJwtPayload>({
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          active: user.active,
          role: user.role,
          image: user.image,
        }),
      });
    } else {
      throw new UnauthorizedError("invalid email or password");
    }
  };

  /**
   * A route to refresh the access token.
   * The client must provide the refresh token in the Authorization header.
   * The response will contain the new access token and refresh token.
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   */
  export const refreshToken: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const validatedData = await refreshTokenSchema.validateAsync(req.body);
    const response = Auth.verifyRefreshToken(validatedData.refresh);
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: response.id },
    });

    if (user && !user.active) {
      throw new AccountInactiveError();
    }

    res.status(200).json({
      access: Auth.generateAccessToken<UserJwtPayload>({
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        active: user.active,
        role: user.role,
        image: user.image,
      }),
      refresh: Auth.generateRefreshToken<UserJwtPayload>({
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        active: user.active,
        role: user.role,
        image: user.image,
      }),
    });
  };
}
