import { Settings } from "@/settings";
import bcrypt from "bcryptjs";

export class Password {
  static async hashPassword(password: string, salt: number = Settings.SALT) {
    return bcrypt.hashSync(password, salt);
  }
  static comparePassword(password: string, hashPassword: string) {
    return bcrypt.compareSync(password, hashPassword);
  }
}
