import 'dotenv/config';
import express from "express";
import session from "express-session";
import mariaDB from "mariadb";
import cors from "cors";

import {createUser, login} from './accountFunctions.js';
import {RegisterResponse, JwtPayload} from './userInterfaces'


const app = express();
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

app.post('/register', (req, res) => {
  const operationStatus: Promise<RegisterResponse> = createUser(req.body.registerData, pool);
  res.send(operationStatus);
});
app.post('/login', (req, res) => {
  const operationStatus: Promise<JwtPayload> = login(req.body.loginData, pool);
  res.send(operationStatus);
});

app.listen(process.env.PORT, (): void => {
  console.log(`Server is listening on PORT : ${process.env.PORT}`);
});