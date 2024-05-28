"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.details = exports.list = exports.contact = void 0;
const path_1 = require("path");
const Message_1 = __importDefault(require("../models/Message"));
const cleanValue_1 = require("../utils/functions/cleanValue");
const verifInput_1 = require("../utils/functions/verifInput");
const findMessages = async () => {
    return await Message_1.default.find();
};
const contact = async (req, res, next) => {
    const session = req.session;
    const isConnected = session.isConnected ?? false;
    const roleConnected = res.locals.roleUser ?? false;
    try {
        if (req.body.email) {
            const inputs = [
                { type: 'string', name: 'lastname', message: '' },
                { type: 'string', name: 'firstname', message: '' },
                { type: 'email', name: 'email', message: '' },
                { type: 'string', name: 'subject', message: '' },
                { type: 'string', name: 'message', message: '' }
            ];
            (0, verifInput_1.verifInputs)(req, res, inputs);
            const { firstname, lastname, email, subject, message } = req.body;
            const fullname = `${firstname} ${lastname}`;
            const newMessage = new Message_1.default({
                from: (0, cleanValue_1.cleanValue)(email),
                fullname: (0, cleanValue_1.cleanValue)(fullname),
                subject: (0, cleanValue_1.cleanValue)(subject),
                message: (0, cleanValue_1.cleanValue)(message),
            });
            newMessage.save()
                .then((result) => {
                console.log(`Message sauvegardé : ${result}`);
                res.status(200).json({ url: '/contact', message: { type: 'success', text: 'Message envoyé avec succès' } });
            })
                .catch((error) => { throw new Error(`Error Save Message : ${error}`); });
        }
        else {
            res.status(200).render((0, path_1.join)(__dirname, "../views/contact.ejs"), { isConnected: isConnected, roleConnected: roleConnected });
        }
    }
    catch (error) {
        console.log(`${error}`);
        res.status(200).render((0, path_1.join)(__dirname, "../views/contact.ejs"), { isConnected: isConnected, roleConnected: roleConnected, message: { type: 'error', text: "Erreur lors de l'envoie du message" } });
    }
};
exports.contact = contact;
const list = async (req, res) => {
    const session = req.session;
    const isConnected = session.isConnected ?? false;
    const roleConnected = res.locals.roleUser ?? false;
    try {
        if (roleConnected !== 1) {
            res.status(401).render((0, path_1.join)(__dirname, "../views/errors/error-401.ejs"), { isConnected: isConnected, roleConnected: roleConnected });
        }
        else {
            await findMessages()
                .then(messages => {
                res.status(200).render((0, path_1.join)(__dirname, "../views/management/messages/list-message.ejs"), { isConnected: isConnected, roleConnected: roleConnected, messages: messages });
            })
                .catch(error => { throw new Error(`Error findUsers List Users : ${error}`); });
        }
    }
    catch (error) {
        console.log(`Erreur List Messages : ${error}`);
        res.status(401).render((0, path_1.join)(__dirname, "../views/errors/error-401.ejs"), { isConnected: isConnected, roleConnected: roleConnected, message: { type: 'error', text: 'List Messages' } });
    }
};
exports.list = list;
const details = (req, res, next) => {
    const session = req.session;
    const isConnected = session.isConnected ?? false;
    const roleConnected = res.locals.roleUser ?? false;
    const detailsMessage = res.locals.detailsMessage ?? false;
    try {
        if (!isConnected || roleConnected !== 1 || !detailsMessage) {
            res.status(401).render((0, path_1.join)(__dirname, "../views/errors/error-401.ejs"), { isConnected: isConnected, roleConnected: roleConnected });
        }
        else {
            res.status(200).render((0, path_1.join)(__dirname, "../views/management/messages/details-message.ejs"), { message: detailsMessage, isConnected: isConnected, roleConnected: roleConnected });
        }
    }
    catch (error) {
        console.log(`Erreur details Message : ${error}`);
        res.status(500).render((0, path_1.join)(__dirname, "../views/errors/error-500.ejs"), { isConnected: isConnected, roleConnected: roleConnected, message: { type: 'error', text: 'Details Message' } });
    }
};
exports.details = details;
const remove = (req, res) => {
    const session = req.session;
    const isConnected = session.isConnected ?? false;
    const roleConnected = res.locals.roleUser ?? 0;
    const detailsMessage = res.locals.detailsMessage ?? false;
    try {
        if (req.method === 'DELETE') {
            Message_1.default.deleteOne({ _id: (0, cleanValue_1.cleanValue)(req.params.id) })
                .then(() => {
                res.status(200).json({ url: '/messages', message: { type: 'success', text: `Message supprimé avec succès.` } });
            })
                .catch(error => { throw new Error(`Error deleteOne Delete Message : ${error}`); });
        }
        else {
            if (!isConnected || roleConnected !== 1 || !detailsMessage) {
                res.status(302).redirect("/");
            }
            else {
                res.status(200).render((0, path_1.join)(__dirname, "../views/management/messages/delete-message.ejs"), { isConnected: isConnected, roleConnected: roleConnected, message: detailsMessage });
            }
        }
    }
    catch (error) {
        console.log(`${error}`);
        res.status(500).render((0, path_1.join)(__dirname, "../views/management/messages/delete-message.ejs"), { isConnected: isConnected, roleConnected: roleConnected, message: detailsMessage });
    }
};
exports.remove = remove;
