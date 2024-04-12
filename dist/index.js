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
import { createUser, login } from './accountFunctions.js';
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
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
app.get('/', (req, res) => {
    res.end();
});
app.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const operationStatus = yield createUser(req.body, pool);
        res.send(operationStatus);
    }
    catch (err) {
        console.log(err);
        res.status(500).send('Please retry or contact with server administrator');
    }
}));
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const operationStatus = yield login(req.body, pool);
    if (operationStatus.jwt) {
    }
    else {
        res.send(operationStatus);
    }
}));
app.listen(process.env.PORT, () => {
    console.log(`Server is listening on PORT : ${process.env.PORT}`);
});
//# sourceMappingURL=index.js.map