import 'dotenv/config';
import express from "express";
import session from "express-session";
import mariaDB from "mariadb";
import cors from "cors";
import cookieParser from 'cookie-parser';

import {createUser, login, getUserById, changePassword, getUserByEmail} from './accountFunctions.js';
import {getRecoveryToken, getEmailByToken, sendRecoveryCode} from './passwordRecovery.js';
import {sendWelcomeEmail} from './email.js';
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

app.post('/register', async (req, res) => {
  try {
    const operationStatus: RegisterResponse = await createUser(pool, req.body);
    await sendWelcomeEmail({email : req.body.email, username : req.body.username});
    res.status(200);
    res.json(operationStatus);
  } catch (err) {
    res.status(500).send('Please retry or contact with server administrator');
  }
});

app.post('/login', async (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  const userData: SessionResponse = await login(pool, req.body);
  try {
    if (userData.id) {
      res.cookie('userId', userData, {maxAge: 90000, httpOnly: true});
      res.status(200).json({errorMessage: 'Login process went successful'});
    } else {
      res.status(401).json({errorMessage: userData.error});
    }
  } catch (err) {
    console.log(err);
  } finally {
    res.end();
  }
});

app.post('/userData', async (req, res) => {
  try {
    const userData = await getUserById(pool, req.cookies.userId.id);
    res.json(userData.user);
  } catch (err) {
    res.status(403);
    res.send('No cookie');
  } finally {
    res.end();
  }
});

app.post('/passwordRecoveryToken', async (req, res) => { //dev move to passwordRecovery.ts and first check if users with this email exists
  const account = await getUserByEmail(pool, req.body.email)
  if(account){
  await sendRecoveryCode(pool, req.body.email);
  }
  res.status(200);
});

app.post('/checkRecoveryToken', async (req, res, next) => {
  try {
    const email = await getEmailByToken(pool, req.body.token);
    if (email) {
      res.status(200);
      res.json({"errorMessage": null});
    } else {
      res.status(403);
      res.json({"errorMessage": 'Token is not valid'});
    }
  } catch (err) {
    res.status(403);
    res.send('No token !');
  } finally {
    res.end();
  }
});

app.post('/changePassword', async (req, res) => {
  try {
    const email = await getEmailByToken(pool, req.body.token);
    const token = await getRecoveryToken(email, pool);
    if (token === req.body.token) {
      console.log('handler : updating user with email : ', email.email, 'changing password to : ', req.body.password); //dev change naming of email.email
      await changePassword(pool, {email: email.email, password: req.body.password});
    } else {
      res.status(404)
      res.send('Access denied. Please contact with service administrator.');
    }
  } catch (err) {
    console.log(err);
    res.status(503);
    res.send('Service not available. Please contact with service administrator.');
  } finally {
    res.end()
  }
});

app.listen(process.env.PORT, (): void => {
  console.log(`Server is listening on PORT : ${process.env.PORT}`);
});