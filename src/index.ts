import 'dotenv/config';
configDotenv();

const { PORT, SESSION_SECRET, DATABASE_PASSWORD, NODE_ENV } = process.env;

if (!PORT || !SESSION_SECRET || !DATABASE_PASSWORD) {
  throw new Error('Missing essential environment variables');
}

import express from "express";
import session from "express-session";
import cookieParser from 'cookie-parser';
import cors from "cors";

import auth from "./routes/auth.js";
import tasks from "./routes/tasks.js";
import user from "./routes/user.js";
import {configDotenv} from "dotenv";

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.use(auth);
app.use(tasks);
app.use(user);

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(session({
  secret: process.env.SESSION_SECRET as string,
  saveUninitialized: true,
  resave: false,
  cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: true } // Not sure what is this
}));

app.listen(process.env.PORT, (): void => {
  console.log(`Server is listening on PORT : ${process.env.PORT}`);
});