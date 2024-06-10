import express from "express";
import {pullTasksList} from "../middleware/tasksManagement.js";
import {getEmailByToken} from "../middleware/passwordRecovery.js";

import pool from "../dbPool.js";
import cors from "cors";
import logger from '../logger.js'

const router = express.Router();

router.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));


router.post('/getTasksList', async (req, res) => {
  try {
    // dev add some auth
    const response = await pullTasksList(pool, req.cookies.userId.id, 4, 2024);
    res.status(200);
    res.json(response);
  } catch (err) {
    logger.error(`Error during fetching tasks list`, err);
  }
});

router.post('/saveTask', (req, res) => {
  const task = req.body.task;
  const user = getEmailByToken(pool, req.cookies.userId.id);
  console.log('Saving task for user : ', user);
});

router.post('/updateTask', (req, res) => {
  const task = req.body.task;
  const user = getEmailByToken(pool, req.cookies.userId.id);
  console.log('Updating task for user : ', user);
});

router.post('/deleteTask', (req, res) => {
  const task = req.body.task;
  const user = getEmailByToken(pool, req.cookies.userId.id);
  console.log('Deleting task for user : ', user);
});

export default router;