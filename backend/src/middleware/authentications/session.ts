import { NextFunction, Request, RequestHandler, Response } from "express";

const sessionAuthentication: RequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    next();
};

export default sessionAuthentication