var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import { pullTasksList } from "../middleware/tasksManagement.js";
import { getEmailByToken } from "../middleware/passwordRecovery.js";
import pool from "../dbPool.js";
import cors from "cors";
import logger from '../logger.js';
const router = express.Router();
router.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
router.post('/getTasksList', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield pullTasksList(pool, 15, 4, 2024);
        console.log(response);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        logger.error(`Error during fetching tasks list`, err);
    }
}));
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
//# sourceMappingURL=tasks.js.map