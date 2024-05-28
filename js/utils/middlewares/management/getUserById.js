"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = void 0;
const User_1 = __importDefault(require("../../../models/User"));
const cleanValue_1 = require("../../functions/cleanValue");
const path_1 = require("path");
const getUserById = async (req, res, next) => {
    const session = req.session;
    const isConnected = session.isConnected ?? false;
    const roleConnected = res.locals.roleUser ?? 0;
    console.log('id getUserById : ', req.params.id);
    try {
        const user = await User_1.default.findOne({ _id: (0, cleanValue_1.cleanValue)(req.params.id) }).populate('address');
        if (user) {
            res.locals.detailsUser = user;
            next();
        }
        else {
            throw new Error(`user not found`);
        }
    }
    catch (error) {
        console.log(`Error GetUserById : ${error}`);
        res.status(404).render((0, path_1.join)(__dirname, "../../views/errors/error-404.ejs"), { isConnected: isConnected, roleConnected: roleConnected, message: { type: "error", text: "Get User" } });
    }
};
exports.getUserById = getUserById;
