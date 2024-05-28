"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboard = void 0;
const path_1 = require("path");
const dashboard = (req, res, next) => {
    const session = req.session;
    const isConnected = session.isConnected ? session.isConnected : false;
    const roleConnected = res.locals.roleUser ?? false;
    if (roleConnected !== 1) {
        res.status(200).redirect("/");
    }
    else {
        res.status(200).render((0, path_1.join)(__dirname, "../views/management/dashboard.ejs"), { isConnected: isConnected, roleConnected: roleConnected });
    }
};
exports.dashboard = dashboard;
