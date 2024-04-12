import 'dotenv/config';
import express from "express";
import session from "express-session";
import mariaDB from "mariadb";
import cors from "cors";

import {createUser, login} from './accountFunctions.js';
import {RegisterResponse, JwtPayload} from './userInterfaces';


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
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
  res.end();
});

app.post('/register', async (req, res) => {
  try{
  const operationStatus : RegisterResponse= await createUser(req.body, pool);
  res.send(operationStatus);
  }catch(err){
    console.log(err);
    res.status(500).send('Please retry or contact with server administrator');
  }
});
app.post('/login', async (req, res) => {
  const operationStatus: JwtPayload = await login(req.body, pool);
  if(operationStatus.jwt){

  }else{
  res.send(operationStatus);
  }
});

app.listen(process.env.PORT, (): void => {
  console.log(`Server is listening on PORT : ${process.env.PORT}`);
});