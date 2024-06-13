import express from "express";
import { pullTasksList, pushTask } from "../middleware/tasksManagement.js";
import { getUserById } from "../middleware/accountFunctions.js";
import pool from "../dbPool.js";
import cors from "cors";
import logger from '../logger.js';
const router = express.Router();
router.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
router.post('/getTasksList', async (req, res) => {
    try {
        const response = await pullTasksList(pool, req.cookies.userId.id, 10, 2024);
        res.status(200);
        console.log(response);
        res.json(response);
    }
    catch (err) {
        logger.error(`Error during fetching tasks list`, err);
    }
});
router.post('/pushTask', async (req, res) => {
    try {
        const task = req.body.task;
        const userId = req.cookies.userId.id;
        await pushTask(pool, task, userId);
        console.log('Saving task for user : ', userId);
    }
    catch (err) {
        logger.error(`Error during pushTask`, err);
    }
});
router.post('/updateTask', (req, res) => {
    const task = req.body.task;
    const user = getUserById(pool, req.cookies.userId.id);
    console.log('Updating task for user : ', user);
});
router.post('/deleteTask', (req, res) => {
    const task = req.body.task;
    const user = getUserById(pool, req.cookies.userId.id);
    console.log('Deleting task for user : ', user);
});
export default router;
//# sourceMappingURL=tasks.js.map