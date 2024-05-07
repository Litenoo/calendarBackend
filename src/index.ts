import 'dotenv/config';
import express from "express";
import session from "express-session";
import mariaDB from "mariadb";
import cors from "cors";
import cookieParser from 'cookie-parser';

import {createUser, login, getUserById} from './accountFunctions.js';
import {createRecoveryToken, getRecoveryToken} from './passwordRecovery.js';
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
  try{
    const userData = await getUserById(req.cookies.userId.id, pool);
    res.json(userData.user);
  }catch(err){
    res.status(403);
    res.send('No cookie');
  }finally{
  res.end();
  }
});

app.post('/changePassword', async (req, res)=>{ //dev move to passwordRecovery.ts
  try{
    const usersEmail = JSON.stringify(req.body.email);
    await createRecoveryToken(usersEmail, pool);
    const recoveryToken = await getRecoveryToken(usersEmail, pool);
    const recoveryLink = 'http://localhost:5173/changePassword?token=' + recoveryToken.token; // dev if it is possible change that to real one url + its not needed to fetch 2 times same toiken
    console.log('recoverylink : ', recoveryLink);

    await fetch(' https://api.mailersend.com/v1/email', {
      method:'POST',
      headers:{
        'Content-Type' : 'application/json',
        'X-Requested-With':'XMLHttpRequest',
        'Authorization' : 'Bearer mlsn.af2fb9be9fb0adcddc76eddbe1949b689777c3754d4c7948da5996af0191b9cc',
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
            'email': 'pokelukaspl@gmail.com', //replace with users email
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
    })
  }catch(err){
    console.log(err);
  }
});

app.listen(process.env.PORT, (): void => {
  console.log(`Server is listening on PORT : ${process.env.PORT}`);
});