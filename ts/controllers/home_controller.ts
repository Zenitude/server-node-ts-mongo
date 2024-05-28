import { Request, Response, NextFunction } from "express";
import { join } from "path";
import { CustomType } from "../utils/types/types";

export const home = (req: Request, res: Response, next: NextFunction) => {
    const session = req.session as CustomType;
    session.maVariable = "";
    const isConnected = session.isConnected ? session.isConnected : false;
    const roleConnected = res.locals.roleUser ?? false;
    res.status(200).render(join(__dirname, "../views/index.ejs"), { isConnected: isConnected, roleConnected: roleConnected })
}
