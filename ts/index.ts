/* Import */
import express, { json, urlencoded } from "express";
import { join } from "path";
import { config } from 'dotenv';
import { dateMiddleware } from "./utils/middlewares/date";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import session from "express-session";
import { routes } from "./routes/routes";
import { connectMongo } from './utils/database/mongodb';
import helmet from "helmet";

/* Config Server */
const app = express();
config();

/* Connect Database */
connectMongo();

/* Middlewares */
app.use(json())
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            styleSrc : ["'self'"],
		}
    },
    crossOriginOpenerPolicy: { policy: "unsafe-none" },
    crossOriginResourcePolicy: false,
    originAgentCluster: false,
    xContentTypeOptions: true
}));
app.use(cookieParser());
app.use(session({
    secret: process.env.SECRET_KEY_SESSION as string,
    resave: false,
    saveUninitialized: false
}))

app.use(dateMiddleware);
app.use(morgan('dev'));

/* Static Folder/File */
app.use('/images', express.static(join(__dirname, "./public/images/")));
app.use('/styles', express.static(join(__dirname, "./public/styles/")));
app.use('/scripts', express.static(join(__dirname, "./public/scripts/")));

/* Routes */
routes.forEach(route => app.use(route));

/* Listen Server */
const host = process.env.HOST ? process.env.HOST : "localhost";
const port = process.env.PORT ? process.env.PORT : 3000;

app.listen(port, () => {
    console.log(`Le serveur est disponible à l'adresse : http://${host}:${port}/`);
});