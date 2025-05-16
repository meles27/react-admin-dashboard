import { AppDataSource } from "@/data-source";
import { sendTokenEmail } from "@/email";
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

  export const requestPasswordReset: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    /**get username from request */
    const validatedData = await forgetPasswordSchema.validateAsync(req.body);

    await AppDataSource.transaction(async (transactionManager) => {
      try {
        const tokenRepository = transactionManager.getRepository(ResetToken);
        const userRepository = transactionManager.getRepository(User);
        /**
         * get user requesting password reset
         */
        const user = await throwErrorIfNotFound(userRepository, {
          where: { username: validatedData.username },
        });
        /**
         * if there is old token remove it & create new reset token
         */
        const resetToken = await tokenRepository.findOne({
          where: {
            user: user,
          },
        });
        /**
         * remove the old reset token
         */
        if (resetToken) {
          await tokenRepository.delete({
            id: resetToken.id,
          });
        }
        /**
         * generate token and save
         */
        const newResetToken = new ResetToken();
        newResetToken.user = user;
        newResetToken.token = Auth.generateEmailToken<EmailJwtPayload>({
          id: user.id,
        });
        await tokenRepository.save(newResetToken);
        sendTokenEmail(user.email, newResetToken.token);
        res.status(200).json({
          detail: "check your email for reset token",
        });
      } catch (error) {
        next(error);
      }
    });
  };

  export const resetPassword: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const validatedData = await confirmForgetPasswordSchema.validateAsync(
      req.body
    );

    // get token and user
    const tokenRepository = AppDataSource.getRepository(ResetToken);
    const tokenObj = await tokenRepository.findOne({
      where: {
        token: validatedData.token,
      },
      relations: {
        user: true,
      },
    });
    if (!tokenObj) {
      throw new ValidationError("invalid Token");
    }
    /** get user */
    const userRepository = AppDataSource.getRepository(User);
    const userObj = await userRepository.findOneBy({
      id: tokenObj.user.id,
    });
    if (!userObj) {
      throw new ValidationError("invalid Token");
    }
    // hash the password
    userObj.password = await Password.hashPassword(validatedData.password);
    // save the user
    await userRepository.save(userObj);
    // remove the token
    await tokenRepository.remove(tokenObj);
    res.status(200).json({
      detail: "password reset successfully",
    });
  };
}
