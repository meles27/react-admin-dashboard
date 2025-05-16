import { NextFunction, Request, RequestHandler, Response } from "express";

const tokenAuthentication: RequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    next();
};

export default tokenAuthentication