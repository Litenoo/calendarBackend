import 'dotenv/config';
import express from "express";
import session from "express-session";
import mariaDB from "mariadb";
import cors from "cors";
import cookieParser from 'cookie-parser';
import crypto from 'crypto';

import {createUser, login, getUserById} from './accountFunctions.js';
import {RegisterResponse, SessionResponse} from './userInterfaces';


const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(session({
  secret: process.env.SESSION_SECRET as string,
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
})


app.get('/', (req, res) => {
  console.log('/ handled');
  res.send('hello !');
  res.end();
});

// app.get('/checkCookie', (req, res, next)=>{
//   if(req.cookies.userId){
//     res.status(401).send("Invalid or missing cookie");
//   }
//   const hash = crypto.createHash('sha256').update(req.cookies.userId + process.env.COOKIE_SECRET).digest('hex');
//   if(hash !== req.cookies.userId){
//     res.status(401).send("Invalid cookie")
//   }
//   next();
// })

app.post('/register', async (req, res) => {
  try {
    const operationStatus: RegisterResponse = await createUser(req.body, pool);
    res.send(operationStatus);
  } catch (err) {
    ``
    console.log(err);
    res.status(500).send('Please retry or contact with server administrator');
  }
});

app.post('/login', async (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  const userData: SessionResponse = await login(req.body, pool);
  try {
    if (userData.id) {
      res.cookie('userId', userData, {maxAge: 90000, httpOnly: true});
      res.status(200).send({message: 'Login process went successful'});
    } else {
      res.status(401).json({message: userData.error});
    }
  } catch (err) {
    console.log(err);
  } finally {
    res.end();
  }
});

app.post('/userData', async (req, res) => {
  console.log('/userData cookie : ', req.cookies.userId);
  const userData = await getUserById(req.cookies.userId.id, pool);
  console.log('userData (87): ', userData);
  res.json(userData.user);
  res.end();
});

app.listen(process.env.PORT, (): void => {
  console.log(`Server is listening on PORT : ${process.env.PORT}`);
});