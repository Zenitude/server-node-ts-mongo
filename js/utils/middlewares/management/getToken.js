"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const path_1 = require("path");
const getToken = (req, res, next) => {
    const session = req.session;
    const isConnected = session.isConnected ?? false;
    const roleConnected = res.locals.roleUser ?? false;
    try {
        const token = req.cookies.token ?? false;
        if (!token) {
            next();
        }
        else {
            if (!process.env.SECRET_KEY_TOKEN) {
                throw new Error('Error Secret Key Token Auth');
            }
            const decodedToken = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY_TOKEN);
            session.decodedToken = decodedToken;
            next();
        }
    }
    catch (error) {
        console.log(`${error}`);
        res.status(401).render((0, path_1.join)(__dirname, "../../views/errors/error-401.ejs"), { isConnected: isConnected, roleConnected: roleConnected, message: { type: 'error', text: 'Token' } });
    }
};
exports.getToken = getToken;
