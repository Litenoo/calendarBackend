import 'dotenv/config';
import express from "express";
import session from "express-session";
import cors from "cors";
import mariaDB from "mariadb";
import {createUser, login} from './accountFunctions.js';


//functions


//implementations
const app = express();
app.use(cors());

app.use(session({
    secret: "password", // change to env file later
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
})

app.get('/', (req, res) => {
    res.end();
});

app.post('/register', (req, res) => {
    createUser(req.body.registerData, pool);
});
app.post('/login', (req, res) => {
    login(req.body.loginData, pool);
});

async function foo (){
// const registerInfo = await createUser({
//     email:'r@r',
//     password: 'r',
//     username:'r',
// }, pool);
// console.log(registerInfo);

    login({email:'w@w', password:'w'}, pool);
}
foo();

app.listen(3000, (): void => {
    console.log("server is listening on port : 3000");
});