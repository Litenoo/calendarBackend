import 'dotenv/config';
import express from "express";
import session from "express-session";
import mariaDB from "mariadb";
import cors from "cors";
import cookieParser from 'cookie-parser';

import {createUser, login, getUserById} from './accountFunctions.js';
import {RegisterResponse, SessionResponse} from './userInterfaces';
import {EmailParams, MailerSend, Recipient, Sender} from "mailersend";


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

const sentFrom = new Sender("gyfonk482@gmail.com", "noreply");

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

const mailerSend = new MailerSend({
  apiKey: process.env.MAIL_API_KEY as string,
});

app.post('/changePassword', async (req, res)=>{
  try{
    const usersEmail = JSON.stringify(req.body.email);

    const sentFrom = new Sender("MS_8EhF3E@trial-ynrw7gyq7oo42k8e.mlsender.net", "noreply");

    const recipients = [
      new Recipient("pokelukaspl@gmail.com", "Client")
    ];


    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject("This is a Subject")
      .setHtml("<strong>This is the HTML content</strong>")
      .setText("This is the text content");

    mailerSend.email
      .send(emailParams)
      .then((response) => console.log(response))
      .catch((error) => console.log(error));

  }catch(err){
    console.log(err);
  }
});

app.listen(process.env.PORT, (): void => {
  console.log(`Server is listening on PORT : ${process.env.PORT}`);
});