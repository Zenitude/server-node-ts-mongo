import { Request, Response, NextFunction } from "express";
import { join } from "path";
import { CustomType } from "../utils/types/types";

export const errors = (req: Request, res: Response, next: NextFunction) => {
    const session = req.session as CustomType;
    const isConnected = session.isConnected ?? false ;
    const roleConnected = res.locals.roleUser ?? false;

    res.status(400).render(join(__dirname, "../views/errors/error-400.ejs"), { isConnected: isConnected, roleConnected : roleConnected})
}