import {changePassword, getUserByEmail, getUserById} from "../middleware/accountFunctions.js";
import {getEmailByToken, getRecoveryToken, sendRecoveryCode} from "../middleware/passwordRecovery.js";
import express from "express";

import pool from '../dbPool.js';
import cors from "cors";
import logger from '../logger.js';

const router = express.Router();

router.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

router.post('/userData', async (req, res) => {
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

router.post('/passwordRecoveryToken', async (req, res) => { //dev move to passwordRecovery.ts and first check if users with this email exists
  const account = await getUserByEmail(pool, req.body.email);
  if (account) {
    await sendRecoveryCode(pool, req.body.email);
  }
  res.status(200);
});

router.post('/checkRecoveryToken', async (req, res, next) => {
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

router.post('/changePassword', async (req, res) => {
  try {
    const email = await getEmailByToken(pool, req.body.token);
    const token = await getRecoveryToken(email, pool); // dev change email and pool
    if (token === req.body.token) {
      console.log('handler : updating user with email : ', email.email, 'changing password to : ', req.body.password); //dev change naming of email.email
      await changePassword(pool, {email: email.email, password: req.body.password});
    } else {
      res.status(404);
      res.send('Access denied. Please contact with service administrator.');
    }
  } catch (err) {
    logger.error(`Error during changePassword endpoint`, err);
    res.status(503);
    res.send('Service not available. Please contact with service administrator.');
  } finally {
    res.end()
  }
});

export default router;