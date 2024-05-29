import { NextFunction, Request, Response } from "express";

export function loginMiddleware(req: Request, res: Response, next: NextFunction) {
    if (!req.session.user) {
        next();
    } else {
        res.redirect("/quizPage");
    }
};