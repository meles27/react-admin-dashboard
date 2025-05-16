import AppDataSource from "@/data-source";
import { SystemSetting } from "@/entity/SystemSetting";
import { ForbiddenError, InternalServerError } from "@/exceptions/errorClasses";
import { addMonths, isAfter, parseISO } from "date-fns";
import { NextFunction, Request, Response } from "express";
export namespace SystemSettingControllers {
  export const checkSystemExpiry = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const repo = AppDataSource.getRepository(SystemSetting);
    const settings = await repo.findOne({ where: { id: 1 } });

    if (!settings) throw new InternalServerError("System not configured!");

    const expiryDate = parseISO(settings.expiryDate.toISOString());

    if (isAfter(new Date(), expiryDate)) {
      throw new ForbiddenError(
        "System access expired. Contact the owner to refresh."
      );
    }

    next();
  };

  export const refreshSystem = async (req: Request, res: Response) => {
    const repo = AppDataSource.getRepository(SystemSetting);
    const settings = await repo.findOne({ where: { id: 1 } });

    if (!settings) throw new InternalServerError("System not configured!");

    settings.expiryDate = addMonths(new Date(), 1); // Extend by 1 month
    await repo.save(settings);

    res.json({ message: "System refreshed for one more month." });
  };
}
