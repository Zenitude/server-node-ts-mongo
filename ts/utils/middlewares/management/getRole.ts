import { Request, Response, NextFunction } from "express";
import User from "../../../models/User";
import { join } from "path";
import { CustomType } from "../../types/types";

export const getRole = (req: Request, res: Response, next: NextFunction) => {
    const session = req.session as CustomType;
    const isConnected = session.isConnected ?? false;
    const roleConnected = res.locals.roleUser ?? false;

    try {
        const token = session.decodedToken ?? false;

        if (!token) { 
            throw new Error(`Error User not found`);
        }
        else {
            if(!token.userId) { throw new Error(`Erreur Token userId`)}
            
            User.findOne({_id: token.userId})
            .then(user => {
                if(user) {
                    res.locals.roleUser = user.role;
                    next();
                } else {
                    throw new Error(`Error User not found`);
                }
            }).catch(error => { 
                throw new Error(`Error find User GetRole : ${error}`)
            });
        }
    } catch(error) {
        console.log(`${error}`);
        res.status(401).render(join(__dirname, "../../views/errors/error-401.ejs"), {isConnected: isConnected, roleConnected: roleConnected, message: {type: 'error', text: 'Erreur Role'}});
    }
}