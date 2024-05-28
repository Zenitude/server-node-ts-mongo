"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* Import */
const express_1 = __importStar(require("express"));
const path_1 = require("path");
const dotenv_1 = require("dotenv");
const date_1 = require("./utils/middlewares/date");
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_session_1 = __importDefault(require("express-session"));
const routes_1 = require("./routes/routes");
const mongodb_1 = require("./utils/database/mongodb");
const helmet_1 = __importDefault(require("helmet"));
/* Config Server */
const app = (0, express_1.default)();
(0, dotenv_1.config)();
/* Connect Database */
(0, mongodb_1.connectMongo)();
/* Middlewares */
app.use((0, express_1.json)());
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            styleSrc: ["'self'"],
        }
    },
    crossOriginOpenerPolicy: { policy: "unsafe-none" },
    crossOriginResourcePolicy: false,
    originAgentCluster: false,
    xContentTypeOptions: true
}));
app.use((0, cookie_parser_1.default)());
app.use((0, express_session_1.default)({
    secret: process.env.SECRET_KEY_SESSION,
    resave: false,
    saveUninitialized: false
}));
app.use(date_1.dateMiddleware);
app.use((0, morgan_1.default)('dev'));
/* Static Folder/File */
app.use('/images', express_1.default.static((0, path_1.join)(__dirname, "./public/images/")));
app.use('/styles', express_1.default.static((0, path_1.join)(__dirname, "./public/styles/")));
app.use('/scripts', express_1.default.static((0, path_1.join)(__dirname, "./public/scripts/")));
/* Routes */
routes_1.routes.forEach(route => app.use(route));
/* Listen Server */
const host = process.env.HOST ? process.env.HOST : "localhost";
const port = process.env.PORT ? process.env.PORT : 3000;
app.listen(port, () => {
    console.log(`Le serveur est disponible à l'adresse : http://${host}:${port}/`);
});
