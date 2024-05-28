import { Request, Response, NextFunction } from "express";
import { join } from "path";
import { CustomType } from "../utils/types/types";

export const dashboard = (req: Request, res: Response, next: NextFunction) => {
    const session = req.session as CustomType;
    const isConnected = session.isConnected ? session.isConnected : false;
    const roleConnected = res.locals.roleUser ?? false;

    if(roleConnected !== 1) {
        res.status(200).redirect("/");
    } else {
        res.status(200).render(join(__dirname, "../views/management/dashboard.ejs"), { isConnected: isConnected, roleConnected: roleConnected})
    }
}
