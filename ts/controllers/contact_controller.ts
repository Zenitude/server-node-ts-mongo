import { Request, Response, NextFunction } from 'express';
import { join } from "path";
import Message from "../models/Message";
import { cleanValue } from '../utils/functions/cleanValue';
import { verifInputs } from '../utils/functions/verifInput';
import { CustomType } from '../utils/types/types';

const findMessages = async () => {
    return await Message.find();
}

export const contact = async (req: Request, res: Response, next: NextFunction) => {
    const session = req.session as CustomType;
    const isConnected = session.isConnected ?? false ;
    const roleConnected = res.locals.roleUser ?? false;

    try {
        if(req.body.email) {
            const inputs = [
                {type: 'string', name: 'lastname', message: ''},
                {type: 'string', name: 'firstname', message: ''},
                {type: 'email', name: 'email', message: ''},
                {type: 'string', name: 'subject', message: ''},
                {type: 'string', name: 'message', message: ''}
            ]

            verifInputs(req, res, inputs);

            const { firstname, lastname, email, subject, message } = req.body;
            const fullname = `${firstname} ${lastname}`;

            const newMessage = new Message({
                from: cleanValue(email),
                fullname: cleanValue(fullname),
                subject: cleanValue(subject),
                message: cleanValue(message),
            })
            
            newMessage.save()
            .then((result: any) => {
                console.log(`Message sauvegardé : ${result}`);
                res.status(200).json({url: '/contact', message: {type: 'success', text: 'Message envoyé avec succès'}})
            })
            .catch((error: any) => { throw new Error(`Error Save Message : ${error}`)}); 
        } else {
            res.status(200).render(join(__dirname, "../views/contact.ejs"), { isConnected: isConnected, roleConnected : roleConnected})
        }
    } catch(error) {
        console.log(`${error}`);
        res.status(200).render(join(__dirname, "../views/contact.ejs"), { isConnected: isConnected, roleConnected : roleConnected, message: {type: 'error', text:"Erreur lors de l'envoie du message"}})
    }
}

export const list = async (req: Request, res: Response) => {
    const session = req.session as CustomType;
    const isConnected = session.isConnected ?? false;
    const roleConnected = res.locals.roleUser ?? false;

    try {
        if(roleConnected !== 1) {
            res.status(401).render(join(__dirname, "../views/errors/error-401.ejs"), {isConnected: isConnected, roleConnected: roleConnected})
        } else {
            await findMessages()
            .then(messages => {
                res.status(200).render(join(__dirname, "../views/management/messages/list-message.ejs"), {isConnected: isConnected, roleConnected: roleConnected, messages: messages})
            })
            .catch(error => { throw new Error(`Error findUsers List Users : ${error}`)});
        }
    } catch(error) {
        console.log(`Erreur List Messages : ${error}`);
        res.status(401).render(join(__dirname, "../views/errors/error-401.ejs"), {isConnected: isConnected, roleConnected: roleConnected, message: {type: 'error', text: 'List Messages'}})
    }
}

export const details = (req: Request, res: Response, next: NextFunction) => {
    const session = req.session as CustomType;
    const isConnected = session.isConnected ?? false;
    const roleConnected = res.locals.roleUser ?? false;
    const detailsMessage = res.locals.detailsMessage ?? false;

    try {
        if(!isConnected || roleConnected !== 1 || !detailsMessage) {
            res.status(401).render(join(__dirname, "../views/errors/error-401.ejs"), {isConnected: isConnected, roleConnected: roleConnected})
        } else {
            res.status(200).render(join(__dirname, "../views/management/messages/details-message.ejs"), {message: detailsMessage, isConnected: isConnected, roleConnected: roleConnected})
        }
    } catch(error) {
        console.log(`Erreur details Message : ${error}`);
        res.status(500).render(join(__dirname, "../views/errors/error-500.ejs"), {isConnected: isConnected, roleConnected: roleConnected, message:{type:'error', text:'Details Message'}})
    }
}

export const remove = (req: Request, res: Response) => {
    const session = req.session as CustomType;
    const isConnected = session.isConnected ?? false;
    const roleConnected = res.locals.roleUser ?? 0;
    const detailsMessage = res.locals.detailsMessage ?? false;
    
    try {
        if(req.method === 'DELETE') {
            Message.deleteOne({_id: cleanValue(req.params.id) })
            .then(() => {
                res.status(200).json({url: '/messages', message: {type: 'success', text:`Message supprimé avec succès.`}});
            })
            .catch(error => {throw new Error(`Error deleteOne Delete Message : ${error}`)});
        } else {
            if(!isConnected || roleConnected !== 1 || !detailsMessage) {
                res.status(302).redirect("/");
            } else {
                res.status(200).render(join(__dirname, "../views/management/messages/delete-message.ejs"), { isConnected: isConnected, roleConnected: roleConnected, message: detailsMessage})
            }
        }
    } catch(error) {
        console.log(`${error}`);
        res.status(500).render(join(__dirname, "../views/management/messages/delete-message.ejs"), { isConnected: isConnected, roleConnected: roleConnected, message: detailsMessage})
    }
}