import {RegisterResponse, SessionResponse} from "../userInterfaces.js";
import {createUser, login} from "../middleware/accountFunctions.js";
import {sendWelcomeEmail} from "../middleware/email.js";
import express from "express";
import pool from "../dbPool.js";
import cors from "cors";
import logger from "../logger.js";

const router = express.Router();

router.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

router.post('/register', async (req, res) => {
  try {
    const operationStatus: RegisterResponse = await createUser(pool, req.body);
    if (!operationStatus.registerSuccess) {
      res.status(409);
    } else {
      await sendWelcomeEmail({email: req.body.email, username: req.body.username});
      res.status(200);
    }
    res.json(operationStatus);
  } catch (err) {
    res.status(500).send('Please retry or contact with server administrator');
    logger.error(`Error during registration process`, err);
  }
});

router.post('/login', async (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  try {
    const userData: SessionResponse = await login(pool, req.body);
    if (userData.id) {
      res.cookie('userId', userData, {maxAge: 90000, httpOnly: true});
      res.status(200).json({errorMessage: 'Login process went successful'});
    } else {
      res.status(401).json({errorMessage: userData.error});
    }
  } catch (err) {
    logger.error(`Error during login process`, err);
  } finally {
    res.end();
  }
});

export default router;