var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import 'dotenv/config';
import express from "express";
import session from "express-session";
import mariaDB from "mariadb";
import cors from "cors";
import cookieParser from 'cookie-parser';
import { createUser, login, getUserById, changePassword, getUserByEmail } from './accountFunctions.js';
import { getRecoveryToken, getEmailByToken, sendRecoveryCode } from './passwordRecovery.js';
import { sendWelcomeEmail } from './email.js';
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    resave: false,
}));
const pool = mariaDB.createPool({
    host: "127.0.0.1",
    port: 3306,
    user: 'root',
    password: process.env.DATABASE_PASSWORD,
    database: 'calendarApp',
    connectionLimit: 10,
});
app.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const operationStatus = yield createUser(pool, req.body);
        yield sendWelcomeEmail({ email: req.body.email, username: req.body.username });
        res.status(200);
        res.json(operationStatus);
    }
    catch (err) {
        res.status(500).send('Please retry or contact with server administrator');
    }
}));
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    const userData = yield login(pool, req.body);
    try {
        if (userData.id) {
            res.cookie('userId', userData, { maxAge: 90000, httpOnly: true });
            res.status(200).json({ errorMessage: 'Login process went successful' });
        }
        else {
            res.status(401).json({ errorMessage: userData.error });
        }
    }
    catch (err) {
        console.log(err);
    }
    finally {
        res.end();
    }
}));
app.post('/userData', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userData = yield getUserById(pool, req.cookies.userId.id);
        res.json(userData.user);
    }
    catch (err) {
        res.status(403);
        res.send('No cookie');
    }
    finally {
        res.end();
    }
}));
app.post('/passwordRecoveryToken', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const account = yield getUserByEmail(pool, req.body.email);
    if (account) {
        yield sendRecoveryCode(pool, req.body.email);
    }
    res.status(200);
}));
app.post('/checkRecoveryToken', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = yield getEmailByToken(pool, req.body.token);
        if (email) {
            res.status(200);
            res.json({ "errorMessage": null });
        }
        else {
            res.status(403);
            res.json({ "errorMessage": 'Token is not valid' });
        }
    }
    catch (err) {
        res.status(403);
        res.send('No token !');
    }
    finally {
        res.end();
    }
}));
app.post('/changePassword', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = yield getEmailByToken(pool, req.body.token);
        const token = yield getRecoveryToken(email, pool);
        if (token === req.body.token) {
            console.log('handler : updating user with email : ', email.email, 'changing password to : ', req.body.password);
            yield changePassword(pool, { email: email.email, password: req.body.password });
        }
        else {
            res.status(404);
            res.send('Access denied. Please contact with service administrator.');
        }
    }
    catch (err) {
        console.log(err);
        res.status(503);
        res.send('Service not available. Please contact with service administrator.');
    }
    finally {
        res.end();
    }
}));
app.listen(process.env.PORT, () => {
    console.log(`Server is listening on PORT : ${process.env.PORT}`);
});
