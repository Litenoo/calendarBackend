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
import { createUser, login, getUserById } from './accountFunctions.js';
import { createRecoveryToken, getRecoveryToken } from './passwordRecovery.js';
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
        const operationStatus = yield createUser(req.body, pool);
        res.send(operationStatus);
    }
    catch (err) {
        res.status(500).send('Please retry or contact with server administrator');
    }
}));
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    const userData = yield login(req.body, pool);
    try {
        if (userData.id) {
            res.cookie('userId', userData, { maxAge: 90000, httpOnly: true });
            res.status(200).send({ message: 'Login process went successful' });
        }
        else {
            res.status(401).json({ message: userData.error });
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
        const userData = yield getUserById(req.cookies.userId.id, pool);
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
app.post('/changePassword', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const usersEmail = JSON.stringify(req.body.email);
        yield createRecoveryToken(usersEmail, pool);
        const recoveryToken = yield getRecoveryToken(usersEmail, pool);
        const recoveryLink = 'http://localhost:5173/changePassword?token=' + recoveryToken.token;
        console.log('recoverylink : ', recoveryLink);
        yield fetch(' https://api.mailersend.com/v1/email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'Authorization': 'Bearer mlsn.af2fb9be9fb0adcddc76eddbe1949b689777c3754d4c7948da5996af0191b9cc',
            },
            body: JSON.stringify({
                'from': {
                    'email': 'MS_8EhF3E@trial-ynrw7gyq7oo42k8e.mlsender.net'
                },
                'to': [
                    {
                        'email': 'pokelukaspl@gmail.com'
                    }
                ],
                'subject': 'Email Recovery for your calendarApp account',
                'personalization': [
                    {
                        'email': 'pokelukaspl@gmail.com',
                        'data': {
                            'name': 'support noreply',
                            'account_name': 'noreply',
                            'support_email': 'supportCalendarApp@example.com',
                            'link': `${recoveryLink}`,
                        }
                    }
                ],
                'template_id': 'k68zxl2z019lj905',
            })
        });
    }
    catch (err) {
        console.log(err);
    }
}));
app.listen(process.env.PORT, () => {
    console.log(`Server is listening on PORT : ${process.env.PORT}`);
});
//# sourceMappingURL=index.js.map