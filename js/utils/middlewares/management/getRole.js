"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRole = void 0;
const User_1 = __importDefault(require("../../../models/User"));
const path_1 = require("path");
const getRole = (req, res, next) => {
    const session = req.session;
    const isConnected = session.isConnected ?? false;
    const roleConnected = res.locals.roleUser ?? false;
    try {
        const token = session.decodedToken ?? false;
        if (!token) {
            throw new Error(`Error User not found`);
        }
        else {
            if (!token.userId) {
                throw new Error(`Erreur Token userId`);
            }
            User_1.default.findOne({ _id: token.userId })
                .then(user => {
                if (user) {
                    res.locals.roleUser = user.role;
                    next();
                }
                else {
                    throw new Error(`Error User not found`);
                }
            }).catch(error => {
                throw new Error(`Error find User GetRole : ${error}`);
            });
        }
    }
    catch (error) {
        console.log(`${error}`);
        res.status(401).render((0, path_1.join)(__dirname, "../../views/errors/error-401.ejs"), { isConnected: isConnected, roleConnected: roleConnected, message: { type: 'error', text: 'Erreur Role' } });
    }
};
exports.getRole = getRole;
