import { Request, Response, NextFunction, RequestHandler } from "express";

const basicAuthentication: RequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    next();
};

export default basicAuthentication