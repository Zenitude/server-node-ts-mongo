"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.create = exports.details = exports.list = void 0;
const path_1 = require("path");
const validator_1 = require("validator");
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = __importDefault(require("../models/User"));
const verifInput_1 = require("../utils/functions/verifInput");
const findUserByMail_1 = require("../utils/functions/findUserByMail");
const createAddress_1 = require("../utils/functions/createAddress");
const findAddress_1 = require("../utils/functions/findAddress");
const cleanValue_1 = require("../utils/functions/cleanValue");
const findUsers = async () => {
    return await User_1.default.find().populate('address');
};
const newUser = async (req, res, idAddress) => {
    const { firstname, lastname, email, password, role } = req.body;
    const hash = await bcrypt_1.default.hash((0, cleanValue_1.cleanValue)(password), 10);
    const user = new User_1.default({
        firstname: (0, cleanValue_1.cleanValue)(firstname),
        lastname: (0, cleanValue_1.cleanValue)(lastname),
        email: (0, cleanValue_1.cleanValue)(email),
        password: hash,
        address: idAddress && (0, cleanValue_1.cleanValue)(idAddress),
        role: ((0, validator_1.isNumeric)((0, cleanValue_1.cleanValue)(role)) && (0, cleanValue_1.cleanValue)(role).length === 1) ? parseInt((0, cleanValue_1.cleanValue)(role)) : 0
    });
    user.save().then(result => {
        const message = `Utilisateur ${(result.lastname === '' || result.firstname === '') ? result.email : `${result.firstname} ${result.lastname}`} créé avec succès`;
        res.status(201).json({ url: '/users/create', message: { type: 'success', text: message } });
    }).catch(error => {
        throw new Error(`Erreur Save User : ${error}`);
    });
};
const refreshUser = async (req, res, user, idAddress) => {
    const { firstname, lastname, email, role } = await req.body;
    let updatedUser = {
        _id: (0, cleanValue_1.cleanValue)(req.params.id),
        firstname: (0, cleanValue_1.cleanValue)(firstname),
        lastname: (0, cleanValue_1.cleanValue)(lastname),
        password: user.password,
        address: idAddress && idAddress,
        role: parseInt((0, cleanValue_1.cleanValue)(role))
    };
    if (email && user.email !== (0, cleanValue_1.cleanValue)(email)) {
        updatedUser.email = (0, cleanValue_1.cleanValue)(email);
    }
    await User_1.default.updateOne({ _id: (0, cleanValue_1.cleanValue)(req.params.id) }, { ...updatedUser })
        .then(result => {
        const message = `Utilisateur ${(updatedUser.lastname === '' || updatedUser.firstname === '') ? updatedUser.email : `${updatedUser.firstname} ${updatedUser.lastname}`} créé avec succès`;
        res.status(201).json({ url: `/users/${req.params.id}/update`, message: { type: 'success', text: message } });
    }).catch(error => {
        console.log(error);
        throw new Error(`Erreur UpdateOne User : ${error}`);
    });
};
const verifEmail = async (req, res, detailsUser, address) => {
    if (req.body.email && detailsUser.email !== (0, cleanValue_1.cleanValue)(req.body.email)) {
        await User_1.default.findOne({ email: (0, cleanValue_1.cleanValue)(req.body.email) })
            .then(emailExist => {
            if (emailExist) {
                const message = "L'email saisie existe déjà dans la base de données";
                res.status(200).json({ url: `/users/${req.params.id}/update`, message: { type: 'error', text: message } });
            }
            else {
                if (address) {
                    refreshUser(req, res, detailsUser, address._id);
                }
                else {
                    refreshUser(req, res, detailsUser);
                }
            }
        })
            .catch(error => { throw new Error(`Erreur findUserByMail update user : ${error}`); });
    }
    else {
        if (address) {
            refreshUser(req, res, detailsUser, address._id);
        }
        else {
            refreshUser(req, res, detailsUser);
        }
    }
};
const list = async (req, res) => {
    const session = req.session;
    const isConnected = session.isConnected ?? false;
    const roleConnected = res.locals.roleUser ?? 0;
    try {
        if (roleConnected !== 1) {
            res.status(401).render((0, path_1.join)(__dirname, "../views/errors/error-401.ejs"), { isConnected: isConnected, roleConnected: roleConnected });
        }
        else {
            await findUsers()
                .then(users => {
                res.status(200).render((0, path_1.join)(__dirname, "../views/management/users/list-user.ejs"), { isConnected: isConnected, roleConnected: roleConnected, users: users });
            })
                .catch(error => { throw new Error(`Error findUsers List Users : ${error}`); });
        }
    }
    catch (error) {
        console.log(`Erreur List Users : ${error}`);
        res.status(500).render((0, path_1.join)(__dirname, "../views/errors/error-500.ejs"), { isConnected: isConnected, roleConnected: roleConnected, message: { type: 'error', text: 'List Users' } });
    }
};
exports.list = list;
const details = (req, res) => {
    const session = req.session;
    const isConnected = session.isConnected ?? false;
    const roleConnected = res.locals.roleUser ?? false;
    try {
        if (roleConnected !== 1) {
            res.status(401).render((0, path_1.join)(__dirname, "../views/errors/error-401.ejs"), { isConnected: isConnected, roleConnected: roleConnected });
        }
        else {
            const user = res.locals.detailsUser ?? false;
            res.status(200).render((0, path_1.join)(__dirname, "../views/management/users/details-user.ejs"), { user: user, isConnected: isConnected, roleConnected: roleConnected });
        }
    }
    catch (error) {
        console.log(`Erreur details User : ${error}`);
        res.status(500).render((0, path_1.join)(__dirname, "../views/errors/error-500.ejs"), { isConnected: isConnected, roleConnected: roleConnected, message: { type: 'error', text: 'Détails User' } });
    }
};
exports.details = details;
const create = (req, res) => {
    const session = req.session;
    const isConnected = session.isConnected ?? false;
    const roleConnected = res.locals.roleUser ?? 0;
    try {
        if (req.body.email || req.body.lastname || req.body.firstname || req.body.password || req.body.confirm || req.body.street || req.body.zipcode || req.body.city) {
            if (!isConnected || roleConnected !== 1) {
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
                        { type: 'number', name: 'zipcode', message: '' },
                        { type: 'string', name: 'city', message: '' },
                        { type: 'string', name: 'role', message: '' }
                    ];
                    (0, verifInput_1.verifInputs)(req, res, inputs);
                    const street = (0, cleanValue_1.cleanValue)(req.body.street);
                    const zipcode = (0, cleanValue_1.cleanValue)(req.body.zipcode);
                    const city = (0, cleanValue_1.cleanValue)(req.body.city);
                    (0, findUserByMail_1.findUserByMail)(req)
                        .then(user => {
                        if (user) {
                            res.status(401).json({ url: '/users/create', message: { type: "error", text: "Problème lors de la création" } });
                        }
                        else {
                            if (street || zipcode || city) {
                                if (street && zipcode && city) {
                                    (0, findAddress_1.findAddress)(req)
                                        .then(address => {
                                        if (address) {
                                            newUser(req, res, address._id);
                                        }
                                        else {
                                            (0, createAddress_1.createAddress)(req)
                                                .then(result => { newUser(req, res, result.id); })
                                                .catch(error => {
                                                throw new Error(`Erreur CreateAdress Create User : ${error}`);
                                            });
                                        }
                                    })
                                        .catch(error => {
                                        throw new Error(`Error findAddress Create User : ${error}`);
                                    });
                                }
                                else {
                                    res.status(401).json({ url: '/users/create', message: { type: "error", text: "Veuillez compléter tous les champs de votre adresse postal" } });
                                }
                            }
                            else {
                                newUser(req, res);
                            }
                        }
                    })
                        .catch(error => {
                        throw new Error(`Error findUserByMail : ${error}`);
                    });
                }
                else {
                    const message = "Le mot de passe et sa confirmation ne sont pas identique";
                    res.status(200).json({ url: '/users/create', message: { type: "error", text: message } });
                }
            }
            else {
                const message = "Veuillez remplir tous les champs obligatoire";
                res.status(200).json({ url: '/users/create', message: { type: "error", text: message } });
            }
        }
        else {
            if (!isConnected || roleConnected !== 1) {
                res.status(401).redirect('/');
            }
            else {
                res.status(200).render((0, path_1.join)(__dirname, "../views/management/users/create-user.ejs"), { isConnected: isConnected, roleConnected: roleConnected });
            }
        }
    }
    catch (error) {
        console.log(`${error}`);
        res.status(500).render((0, path_1.join)(__dirname, "../views/errors/error-500.ejs"), { isConnected: isConnected, roleConnected: roleConnected, message: { type: 'error', text: "Create User" } });
    }
};
exports.create = create;
const update = (req, res) => {
    const session = req.session;
    const isConnected = session.isConnected ?? false;
    const roleConnected = res.locals.roleUser ?? false;
    const detailsUser = res.locals.detailsUser ?? false;
    try {
        if (req.body.email || req.body.lastname || req.body.firstname || req.body.street || req.body.zipcode || req.body.city) {
            console.log('id update : ', req.params.id);
            if (!isConnected || roleConnected !== 1) {
                res.status(401).redirect('/');
            }
            const inputs = [
                { type: 'string', name: 'lastname', message: '' },
                { type: 'string', name: 'firstname', message: '' },
                { type: 'email', name: 'email', message: 'Email obligatoire' },
                { type: 'string', name: 'street', message: '' },
                { type: 'string', name: 'zipcode', message: '' },
                { type: 'string', name: 'city', message: '' },
                { type: 'string', name: 'role', message: '' }
            ];
            (0, verifInput_1.verifInputs)(req, res, inputs);
            const street = (0, cleanValue_1.cleanValue)(req.body.street);
            const zipcode = (0, cleanValue_1.cleanValue)(req.body.zipcode);
            const city = (0, cleanValue_1.cleanValue)(req.body.city);
            if (street || zipcode || city) {
                if (street !== "" && zipcode !== "" && city !== "") {
                    (0, findAddress_1.findAddress)(req)
                        .then(address => {
                        if (address) {
                            verifEmail(req, res, detailsUser, address);
                        }
                        else {
                            (0, createAddress_1.createAddress)(req)
                                .then(result => {
                                verifEmail(req, res, detailsUser, result);
                            })
                                .catch(error => { throw new Error(`Error createAddress Update User : ${error}`); });
                        }
                    })
                        .catch(error => { throw new Error(`Error findAddress Update User : ${error}`); });
                }
                else {
                    const message = "Veuillez compléter tous les champs de votre adresse postal";
                    res.status(401).json({ url: `/users/${detailsUser._id}/update`, message: { type: 'error', text: message } });
                }
            }
            else {
                verifEmail(req, res, detailsUser);
            }
        }
        else {
            res.status(200).render((0, path_1.join)(__dirname, "../views/management/update-user.ejs"), { isConnected: isConnected, roleConnected: roleConnected, user: detailsUser });
        }
    }
    catch (error) {
        console.log(`${error}`);
        res.status(500).render((0, path_1.join)(__dirname, "../views/errors/error-500.ejs"), { isConnected: isConnected, roleConnected: roleConnected, message: { type: 'error', text: "Update User" } });
    }
};
exports.update = update;
const remove = (req, res) => {
    const session = req.session;
    const isConnected = session.isConnected ?? false;
    const roleConnected = res.locals.roleUser ?? 0;
    const detailsUser = res.locals.detailsUser ?? false;
    try {
        if (req.method === 'DELETE') {
            User_1.default.deleteOne({ _id: (0, cleanValue_1.cleanValue)(req.params.id) })
                .then(() => {
                const message = `Utilisateur supprimé avec succès`;
                res.status(200).json({ url: `/users/`, message: { type: 'success', text: message } });
            }).catch(error => { throw new Error(`Error deleteOne Delete User : ${error}`); });
        }
        else {
            if (!isConnected || roleConnected !== 1 || !detailsUser) {
                res.status(302).redirect('/');
            }
            else {
                res.status(200).render((0, path_1.join)(__dirname, `../views/management/users/delete-user.ejs`), { isConnected: isConnected, roleConnected: roleConnected, user: detailsUser });
            }
        }
    }
    catch (error) {
        console.log(`${error}`);
        res.status(200).render((0, path_1.join)(__dirname, `../views/management/users/delete-user.ejs`), { isConnected: isConnected, roleConnected: roleConnected, user: detailsUser, message: { type: 'error', text: 'Delete User' } });
    }
};
exports.remove = remove;
