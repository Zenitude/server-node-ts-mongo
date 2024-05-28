"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.home = void 0;
const path_1 = require("path");
const home = (req, res, next) => {
    const session = req.session;
    session.maVariable = "";
    const isConnected = session.isConnected ? session.isConnected : false;
    const roleConnected = res.locals.roleUser ?? false;
    res.status(200).render((0, path_1.join)(__dirname, "../views/index.ejs"), { isConnected: isConnected, roleConnected: roleConnected });
};
exports.home = home;
