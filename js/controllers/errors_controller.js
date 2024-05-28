"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errors = void 0;
const path_1 = require("path");
const errors = (req, res, next) => {
    const session = req.session;
    const isConnected = session.isConnected ?? false;
    const roleConnected = res.locals.roleUser ?? false;
    res.status(400).render((0, path_1.join)(__dirname, "../views/errors/error-400.ejs"), { isConnected: isConnected, roleConnected: roleConnected });
};
exports.errors = errors;
