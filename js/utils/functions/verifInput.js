"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifInputs = void 0;
const express_validator_1 = require("express-validator");
const path_1 = require("path");
const verifInputs = (req, res, inputs) => {
    const session = req.session;
    const isConnected = session.isConnected ?? false;
    const roleConnected = res.locals.roleUser ?? false;
    inputs.forEach(input => {
        switch (input.type) {
            case 'string':
                (0, express_validator_1.body)(input.name, input.message).isString().notEmpty();
                break;
            case 'email':
                (0, express_validator_1.body)(input.name, input.message).isEmail().notEmpty();
                break;
            case 'zipcode':
                (0, express_validator_1.body)(input.name, input.message).isPostalCode("FR").notEmpty();
                break;
        }
    });
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        res.status(421).render((0, path_1.join)(__dirname, "../../views/errors/error-421.ejs"), { isConnected: isConnected, roleConnected: roleConnected, message: { type: 'error', text: 'Validation Formulaire' } });
    }
};
exports.verifInputs = verifInputs;
