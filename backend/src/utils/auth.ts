import { Settings } from "@/settings";
import { CustomJwtPayload } from "@/types";
import jwt from "jsonwebtoken";

export class Auth {
  static generateEmailToken<T extends string | Buffer | object>(payload: T) {
    return jwt.sign(payload, Settings.EMAIL_TOKEN_SECRET, {
      expiresIn: Settings.EMAIL_TOKEN_EXPIRES_IN,
    });
  }

  static verifyEmailToken(token: string) {
    return jwt.verify(token, Settings.EMAIL_TOKEN_SECRET);
  }

  static generateAccessToken<T extends string | Buffer | object>(payload: T) {
    return jwt.sign(payload, Settings.JWT.ACCESS_TOKEN_SECRET, {
      expiresIn: Settings.JWT.ACCESS_TOKEN_EXPIRES_IN,
    }); // Access token expires in 15 minutes
  }

  static verifyAccessToken(token: string) {
    return jwt.verify(
      token,
      Settings.JWT.ACCESS_TOKEN_SECRET
    ) as CustomJwtPayload;
  }

  // Static to generate a refresh token
  static generateRefreshToken<T extends string | Buffer | object>(payload: T) {
    return jwt.sign(payload, Settings.JWT.REFRESH_TOKEN_SECRET, {
      expiresIn: Settings.JWT.REFRESH_TOKEN_EXPIRES_IN,
    }); // Refresh token expires in 7 days
  }

  static verifyRefreshToken(token: string) {
    return jwt.verify(
      token,
      Settings.JWT.REFRESH_TOKEN_SECRET
    ) as CustomJwtPayload;
  }
}
