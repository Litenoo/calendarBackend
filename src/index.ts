import 'dotenv/config';
import express from "express";
import session from "express-session";
import mariaDB from "mariadb";
import cors from "cors";
import cookieParser from 'cookie-parser';

import {createUser, login, getUserById, changePassword} from './accountFunctions.js';
import {createRecoveryToken, getRecoveryToken, getEmailByToken} from './passwordRecovery.js';
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
    const operationStatus: RegisterResponse = await createUser(req.body, pool);
    res.status(200);
    res.send(operationStatus);
  } catch (err) {
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
  try {
    const userData = await getUserById(req.cookies.userId.id, pool);
    res.json(userData.user);
  } catch (err) {
    res.status(403);
    res.send('No cookie');
  } finally {
    res.end();
  }
});

app.post('/passwordRecoveryToken', async (req, res) => { //dev move to passwordRecovery.ts and first check if users with this email exists
  try {
    const usersEmail = req.body.email
    await createRecoveryToken(usersEmail, pool);
    const recoveryToken = await getRecoveryToken(usersEmail, pool);
    const recoveryLink = 'http://localhost:5173/changePassword?token=' + recoveryToken.token; // dev if it is possible change that to real one url + it's not needed to fetch 2 times same token

    await fetch(' https://api.mailersend.com/v1/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Authorization': `Bearer ${process.env.MAIL_API_KEY}`,
      },
      body: JSON.stringify({
        'from': {
          'email': `${process.env.MAIL_SENDER}`
        },
        'to': [
          {
            'email': `${usersEmail}`
          }
        ],
        'subject': 'Email Recovery for your calendarApp account',
        'personalization': [
          {
            'email': `${usersEmail}`, //replace with users email
            'data': {
              'name': 'support noreply',
              'account_name': 'noreply',
              'support_email': 'supportCalendarApp@example.com',
              'link': `${recoveryLink}`,
            }
          }
        ],
        'template_id': `${process.env.TEMPLATE_ID}`,
      })
    })
  } catch (err) {
    console.log(err);
  }
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
  try{
    const email = await getEmailByToken(pool, req.body.token);
    const token = await getRecoveryToken(email, pool);
    if (token === req.body.token) {
      console.log('handler : updating user with email : ', email.email, 'changing password to : ', req.body.password); //dev change naming of email.email
      await changePassword(pool, {email: email.email, password: req.body.password});
    }else{
      res.status(404)
      res.send('Access denied. Please contact with service administrator.');
    }
  }catch(err){
    console.log(err);
    res.status(503);
    res.send('Service not available. Please contact with service administrator.');
  }finally{
    res.end()
  }
});

app.listen(process.env.PORT, (): void => {
  console.log(`Server is listening on PORT : ${process.env.PORT}`);
});