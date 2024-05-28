"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.signup = exports.signin = void 0;
const path_1 = require("path");
const User_1 = __importDefault(require("../models/User"));
const verifInput_1 = require("../utils/functions/verifInput");
const findUserByMail_1 = require("../utils/functions/findUserByMail");
const findAddress_1 = require("../utils/functions/findAddress");
const createAddress_1 = require("../utils/functions/createAddress");
const cleanValue_1 = require("../utils/functions/cleanValue");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const signUser = async (req, res, idAddress) => {
    const session = req.session;
    const { firstname, lastname, email, password } = req.body;
    const hash = await bcrypt_1.default.hash((0, cleanValue_1.cleanValue)(password), 10);
    const user = new User_1.default({
        firstname: (0, cleanValue_1.cleanValue)(firstname),
        lastname: (0, cleanValue_1.cleanValue)(lastname),
        email: (0, cleanValue_1.cleanValue)(email),
        password: hash,
        address: idAddress && (0, cleanValue_1.cleanValue)(idAddress),
        role: 0
    });
    user.save().then(result => {
        session.userId = result.id;
        session.isConnected = true;
        const token = jsonwebtoken_1.default.sign({ userId: result._id }, process.env.SECRET_KEY_TOKEN, { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: false,
            secure: false,
            maxAge: 604800000
        });
        const successMessage = `Bienvenue ${(user.lastname === '' || user.firstname === '') ? user.email : `${user.firstname} ${user.lastname}`}`;
        res.status(200).json({ url: '/', message: { type: 'success', text: successMessage } });
    }).catch(error => {
        throw new Error(`${error}`);
    });
};
const signin = (req, res) => {
    const session = req.session;
    const isConnected = session.isConnected ? session.isConnected : false;
    const roleConnected = res.locals.roleUser ?? false;
    try {
        if (req.body.email && req.body.password) {
            if (isConnected) {
                res.status(401).redirect('/');
            }
            const inputs = [
                { type: 'email', name: 'email', message: 'Email obligatoire' },
                { type: 'string', name: 'password', message: 'Mot de passe obligatoire' },
            ];
            (0, verifInput_1.verifInputs)(req, res, inputs);
            (0, findUserByMail_1.findUserByMail)(req)
                .then(user => {
                if (user) {
                    const compare = bcrypt_1.default.compare((0, cleanValue_1.cleanValue)(req.body.password), user.password);
                    compare
                        .then(compared => {
                        if (compared) {
                            session.isConnected = true;
                            session.userId = user._id;
                            const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.SECRET_KEY_TOKEN, { expiresIn: '7d' });
                            res.cookie('token', token, {
                                httpOnly: false,
                                secure: false,
                                maxAge: 604800000
                            });
                            const successMessage = `Bienvenue ${(user.lastname === '' || user.firstname === '') ? user.email : `${user.firstname} ${user.lastname}`}`;
                            res.status(200).json({ url: '/', message: { type: 'success', text: successMessage } });
                        }
                        else {
                            res.status(401).json({ url: '/signin', message: { type: "error", text: 'Identifiants incorrect' } });
                        }
                    })
                        .catch(error => { throw new Error(`${error}`); });
                }
                else {
                    res.status(401).json({ url: '/signin', message: { type: 'error', text: 'Identifiants incorrect' } });
                }
            })
                .catch(error => {
                throw new Error(`${error}`);
            });
        }
        else {
            if (isConnected) {
                res.status(302).redirect('/');
            }
            else {
                res.status(200).render((0, path_1.join)(__dirname, "../views/sign/signin.ejs"), { isConnected: isConnected });
            }
        }
    }
    catch (error) {
        console.log(`Erreur connexion : ${error}`);
        res.status(500).render((0, path_1.join)(__dirname, "../views/errors/error-500.ejs"), { isConnected: isConnected, roleConnected: roleConnected, message: { type: 'error', text: 'Signin' } });
    }
};
exports.signin = signin;
const signup = (req, res) => {
    const session = req.session;
    const isConnected = session.isConnected ?? false;
    const roleConnected = res.locals.roleUser ?? 0;
    try {
        if (req.body.email || req.body.lastname || req.body.firstname || req.body.password || req.body.confirm || req.body.street || req.body.zipcode || req.body.city) {
            if (isConnected) {
                res.status(401).redirect('/');
            }
            if (req.body.email && req.body.password && req.body.confirm) {
                if (req.body.password === req.body.confirm) {
                    const inputs = [
                        { type: 'string', name: 'lastname', message: '' },
                        { type: 'string', name: 'firstname', message: '' },
                        { type: 'email', name: 'email', message: 'Email obligatoire' },
                        { type: 'string', name: 'password', message: 'Mot de passe obligatoire' },
                        { type: 'string', name: 'confirm', message: 'Confirmation obligatoire' },
                        { type: 'string', name: 'street', message: '' },
                        { type: 'string', name: 'zipcode', message: '' },
                        { type: 'string', name: 'city', message: '' },
                    ];
                    (0, verifInput_1.verifInputs)(req, res, inputs);
                    const street = (0, cleanValue_1.cleanValue)(req.body.street);
                    const zipcode = (0, cleanValue_1.cleanValue)(req.body.zipcode);
                    const city = (0, cleanValue_1.cleanValue)(req.body.city);
                    (0, findUserByMail_1.findUserByMail)(req)
                        .then(user => {
                        if (user) {
                            res.status(401).json({ url: 'signup', message: { type: 'error', text: "Problème lors de l'inscription" } });
                        }
                        else {
                            if (street || zipcode || city) {
                                if (street && zipcode && city) {
                                    (0, findAddress_1.findAddress)(req)
                                        .then(address => {
                                        if (address) {
                                            signUser(req, res, address.id);
                                        }
                                        else {
                                            (0, createAddress_1.createAddress)(req)
                                                .then(result => signUser(req, res, result.id))
                                                .catch(error => {
                                                throw new Error(`Erreur createAddress Signup : ${error}`);
                                            });
                                        }
                                    })
                                        .catch(error => {
                                        throw new Error(`Erreur findAddress Signup : ${error}`);
                                    });
                                }
                                else {
                                    res.status(401).json({ url: '/signup', message: { type: 'error', text: "Veuillez compléter tous les champs de votre adresse postal" } });
                                }
                            }
                            else {
                                signUser(req, res);
                            }
                        }
                    })
                        .catch(error => {
                        throw new Error(`Erreur findUserByMail Signup : ${error}`);
                    });
                }
                else {
                    if (isConnected) {
                        res.status(400).redirect('/');
                    }
                    else {
                        res.status(401).json({ url: '/signup', message: { type: "error", text: "Le mot de passe et sa confirmation ne sont pas identique" } });
                    }
                }
            }
            else {
                res.status(401).json({ url: '/signup', message: { type: "error", text: "Veuillez remplir les champs obligatoires" } });
            }
        }
        else {
            if (isConnected) {
                res.status(400).redirect('/');
            }
            else {
                res.status(200).render((0, path_1.join)(__dirname, "../views/sign/signup.ejs"), { isConnected: isConnected, roleConnected: roleConnected });
            }
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).render((0, path_1.join)(__dirname, "../views/errors/error-500.ejs"), { isConnected: isConnected, roleConnected: roleConnected, message: { type: 'error', text: 'Inscription' } });
    }
};
exports.signup = signup;
const logout = (req, res) => {
    const session = req.session;
    const isConnected = session.isConnected ?? false;
    const roleConnected = res.locals.roleUser ?? false;
    try {
        res.clearCookie('token');
        req.session.destroy((err) => { if (err) {
            throw new Error('Erreur Destroy Session');
        } });
        res.status(200).redirect('/');
    }
    catch (error) {
        console.log(`Erreur Déconnexion : ${error}`);
        res.status(500).render((0, path_1.join)(__dirname, "../views/errors/error-500.ejs"), { isConnected: isConnected, roleConnected: roleConnected, message: { type: 'error', text: 'Disconnect' } });
    }
};
exports.logout = logout;
