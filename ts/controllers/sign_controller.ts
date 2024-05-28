import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { join } from "path";
import User from "../models/User";
import { verifInputs } from "../utils/functions/verifInput";
import { findUserByMail } from "../utils/functions/findUserByMail";
import { findAddress } from "../utils/functions/findAddress";
import { createAddress } from "../utils/functions/createAddress";
import { cleanValue } from "../utils/functions/cleanValue";
import { CustomType, OptionCookie } from "../utils/types/types";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const signUser = async (req: Request, res: Response, idAddress?: Types.ObjectId) => {
    const session = req.session as CustomType;
    const { firstname, lastname, email, password } = req.body;

    const hash = await bcrypt.hash(cleanValue(password), 10);
    
    const user = new User({
        firstname: cleanValue(firstname),
        lastname: cleanValue(lastname),
        email: cleanValue(email),
        password: hash,
        address: idAddress && cleanValue(idAddress),
        role: 0
    });

    user.save().then(result => {
        
        session.userId = result.id;
        session.isConnected = true;

        const token : string = jwt.sign(
            { userId: result._id},
            process.env.SECRET_KEY_TOKEN as string,
            { expiresIn: '7d'}
        );

        res.cookie('token', token, <OptionCookie>{
            httpOnly: false,
            secure: false,
            maxAge: 604800000
        });
        
        const successMessage = `Bienvenue ${(user.lastname === '' || user.firstname === '') ? user.email : `${user.firstname} ${user.lastname}` }`;
        res.status(200).json({url: '/', message: {type: 'success', text: successMessage}})
    }).catch(error => {
        throw new Error(`${error}`);
    })
}

export const signin = (req: Request, res: Response) => {
    const session = req.session as CustomType;
    const isConnected = session.isConnected ? session.isConnected : false;
    const roleConnected = res.locals.roleUser ?? false;

    try {
        if(req.body.email && req.body.password) {
            if(isConnected) { res.status(401).redirect('/') }

            const inputs = [
                {type: 'email', name: 'email', message: 'Email obligatoire'},
                {type: 'string', name: 'password', message: 'Mot de passe obligatoire'},
            ]

            verifInputs(req, res, inputs);

            findUserByMail(req)
            .then(user => {
                if(user) {
                    const compare = bcrypt.compare(cleanValue(req.body.password), user.password);

                    compare
                    .then(compared => {
                        if(compared) {
                            session.isConnected = true;
                            session.userId = user._id;

                            const token = jwt.sign(
                                {userId: user._id },
                                process.env.SECRET_KEY_TOKEN as string,
                                {expiresIn: '7d'}
                            )

                            res.cookie('token', token, {
                                httpOnly: false,
                                secure: false,
                                maxAge: 604800000
                            });

                            const successMessage = `Bienvenue ${(user.lastname === '' || user.firstname === '') ? user.email : `${user.firstname} ${user.lastname}` }`;
                            res.status(200).json({url: '/', message: {type: 'success', text: successMessage}})
                        }
                        else {
                            res.status(401).json({url: '/signin', message: {type: "error", text:'Identifiants incorrect'}})
                        }
                    })
                    .catch(error => { throw new Error(`${error}`)});
                }
                else {
                    res.status(401).json({url: '/signin', message: {type: 'error', text: 'Identifiants incorrect'}})
                }
            })
            .catch(error => {
                throw new Error(`${error}`);
            })
        } else {
            if(isConnected) {
                res.status(302).redirect('/');
            } else {
                res.status(200).render(join(__dirname, "../views/sign/signin.ejs"), { isConnected: isConnected })
            }
        }
    } catch(error) {
        console.log(`Erreur connexion : ${error}`);
        res.status(500).render(join(__dirname, "../views/errors/error-500.ejs"), {isConnected: isConnected, roleConnected:roleConnected, message: {type:'error', text:'Signin'}})
    }
}

export const signup = (req: Request, res: Response) => {
    const session = req.session as CustomType;
    const isConnected = session.isConnected ?? false;
    const roleConnected = res.locals.roleUser ?? 0;

    try {
        if(req.body.email || req.body.lastname || req.body.firstname || req.body.password || req.body.confirm || req.body.street || req.body.zipcode || req.body.city) {
            if(isConnected) { res.status(401).redirect('/'); }
            if(req.body.email && req.body.password && req.body.confirm) {
                if(req.body.password === req.body.confirm) {
                    const inputs = [
                        {type: 'string', name: 'lastname', message: ''},
                        {type: 'string', name: 'firstname', message: ''},
                        {type: 'email', name: 'email', message: 'Email obligatoire'},
                        {type: 'string', name: 'password', message: 'Mot de passe obligatoire'},
                        {type: 'string', name: 'confirm', message: 'Confirmation obligatoire'},
                        {type: 'string', name: 'street', message: ''},
                        {type: 'string', name: 'zipcode', message: ''},
                        {type: 'string', name: 'city', message: ''},
                    ]
        
                    verifInputs(req, res, inputs);
                    
                    const street = cleanValue(req.body.street);
                    const zipcode = cleanValue(req.body.zipcode);
                    const city = cleanValue(req.body.city);
                    
                    
                    findUserByMail(req)
                    .then(user => {
                        if(user) { res.status(401).json({url: 'signup', message: {type: 'error', text:"Problème lors de l'inscription"}}) }
                        else {
                            if(street || zipcode || city) {
                                if(street && zipcode && city) {
                                    findAddress(req)
                                    .then(address => {
                                        if(address) { signUser(req, res, address.id)}
                                        else {
                                            createAddress(req)
                                            .then(result => signUser(req, res, result.id))
                                            .catch(error => {
                                                throw new Error(`Erreur createAddress Signup : ${error}`)
                                            })
                                        }
                                    })
                                    .catch(error => { 
                                        throw new Error(`Erreur findAddress Signup : ${error}`)
                                    })
                                } else {
                                    res.status(401).json({url: '/signup', message: {type: 'error', text: "Veuillez compléter tous les champs de votre adresse postal"}})
                                }
                            } else {
                                signUser(req, res);
                            }
                        }
                    })
                    .catch(error => { 
                        throw new Error(`Erreur findUserByMail Signup : ${error}`)
                    })
                } else {
                    if(isConnected) {
                        res.status(400).redirect('/')
                    } else {
                        res.status(401).json({url: '/signup', message: {type: "error", text: "Le mot de passe et sa confirmation ne sont pas identique"}})
                    }
                }
            } else {
                res.status(401).json({url: '/signup', message: {type: "error", text: "Veuillez remplir les champs obligatoires"}})
            }
            
        } else {
            if(isConnected) {
                res.status(400).redirect('/')
            } else {
                res.status(200).render(join(__dirname, "../views/sign/signup.ejs"), {isConnected: isConnected, roleConnected: roleConnected})
            }
        }
    } catch(error) {
        console.log(error);
        res.status(500).render(join(__dirname, "../views/errors/error-500.ejs"), { isConnected: isConnected, roleConnected: roleConnected, message: {type: 'error', text:'Inscription'}})
    }
}

export const logout = (req: Request, res: Response) => {
    const session = req.session as CustomType;
    
    const isConnected = session.isConnected ?? false;
    const roleConnected = res.locals.roleUser ?? false;

    try {
        res.clearCookie('token');
        req.session.destroy((err: any) => { if(err) { throw new Error('Erreur Destroy Session')}});
        res.status(200).redirect('/');
    } catch(error) {
        console.log(`Erreur Déconnexion : ${error}`);
        res.status(500).render(join(__dirname, "../views/errors/error-500.ejs"), {isConnected: isConnected, roleConnected: roleConnected, message: {type: 'error', text: 'Disconnect'}})
    }
}