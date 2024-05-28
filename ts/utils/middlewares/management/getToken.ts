import { Request, Response, NextFunction } from "express";
import jwt, { Secret, JwtPayload } from "jsonwebtoken";
import { join } from "path";
import { CustomType } from "../../types/types";

export const getToken = (req: Request, res: Response, next: NextFunction) => {
    const session = req.session as CustomType;
    const isConnected = session.isConnected ?? false;
    const roleConnected = res.locals.roleUser ?? false;

    try {
        const token = req.cookies.token ?? false;

        if(!token) {
            next();
        } else {
   
            if (!process.env.SECRET_KEY_TOKEN) { throw new Error('Error Secret Key Token Auth') }
            
            const decodedToken = jwt.verify(token, process.env.SECRET_KEY_TOKEN as Secret) as JwtPayload;
            
            session.decodedToken = decodedToken;
            
            next();
        }
    }
    catch(error) {
        console.log(`${error}`);
        res.status(401).render(join(__dirname, "../../views/errors/error-401.ejs"), {isConnected: isConnected, roleConnected: roleConnected, message: {type: 'error', text: 'Token'}})
    }
}