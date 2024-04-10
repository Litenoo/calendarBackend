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
import cors from "cors";
import mariaDB from "mariadb";
import { createUser, login } from './accountFunctions.js';
const app = express();
app.use(cors());
app.use(session({
    secret: "password",
    saveUninitialized: true,
    resave: false,
}));
const pool = mariaDB.createPool({
    host: "127.0.0.1",
    port: 3306,
    user: 'root',
    password: 'Pikachu531',
    database: 'calendarApp',
    connectionLimit: 10,
});
app.get('/', (req, res) => {
    res.end();
});
app.post('/register', (req, res) => {
    createUser(req.body.registerData, pool);
});
app.post('/login', (req, res) => {
    login(req.body.loginData, pool);
});
function foo() {
    return __awaiter(this, void 0, void 0, function* () {
        login({ email: 'w@w', password: 'w' }, pool);
    });
}
foo();
app.listen(3000, () => {
    console.log("server is listening on port : 3000");
});
//# sourceMappingURL=index.js.map