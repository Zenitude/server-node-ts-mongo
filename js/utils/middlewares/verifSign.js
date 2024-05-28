"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifSign = void 0;
const verifSign = (req, res, next) => {
    const session = req.session;
    const isConnected = session.isConnected ? session.isConnected : false;
    if (isConnected === true) {
        res.status(401).redirect('/');
    }
    else {
        next();
    }
};
exports.verifSign = verifSign;
