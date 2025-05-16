import { AppDataSource } from "@/data-source";
import { User } from "@/entity/User";
import { Auth } from "@/utils/auth";
import { NextFunction, Request, Response } from "express";

/**
 * Verifies the JWT token sent in the Authorization header
 * @param {Request} req - The incoming request
 * @param {Response} res - The outgoing response
 * @param {NextFunction} next - The next middleware in the stack
 */
const jwtAuthentication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next();
  }

  const [type, token] = authHeader.split(" ");
  if (type.toLowerCase() !== "bearer") {
    return next();
  }
  const payload: any = Auth.verifyAccessToken(token);
  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOneBy({ id: payload.id });
  req.user = user;
  return next();
};

export default jwtAuthentication;
