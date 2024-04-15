import { Request, Response, NextFunction } from "express";
import User from "../../../models/User";
import { cleanValue } from "../../functions/cleanValue";
import { CustomType } from "../../types/types";
import { join } from "path";
import { sendView } from "../../functions/sendView";

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    const session = req.session as CustomType;
    const isConnected = session.isConnected ?? false ;
    const roleConnected = res.locals.roleUser ?? 0;
    console.log('id getUserById : ', req.params.id)
    try{
        const user = await User.findOne({_id: cleanValue(req.params.id) }).populate('address');
        if(user) {
            res.locals.detailsUser = user;
            next();
        } else {
            throw new Error(`user not found`)
        }
    } catch(error) {
        console.log(`Error GetUserById : ${error}`);
        sendView(res, 404, "error", { isConnected: isConnected, roleConnected: roleConnected, message: {type: "error", text:"Get User"}});
    }
}