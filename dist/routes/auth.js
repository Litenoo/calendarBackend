var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createUser, login } from "../middleware/accountFunctions.js";
import { sendWelcomeEmail } from "../middleware/email.js";
import express from "express";
import pool from "../dbPool.js";
import cors from "cors";
import logger from "../logger.js";
const router = express.Router();
router.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const operationStatus = yield createUser(pool, req.body);
        if (!operationStatus.registerSuccess) {
            res.status(409);
        }
        else {
            yield sendWelcomeEmail({ email: req.body.email, username: req.body.username });
            res.status(200);
        }
        res.json(operationStatus);
    }
    catch (err) {
        res.status(500).send('Please retry or contact with server administrator');
        logger.error(`Error during registration process`, err);
    }
}));
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    try {
        const userData = yield login(pool, req.body);
        if (userData.id) {
            res.cookie('userId', userData, { maxAge: 90000, httpOnly: true });
            res.status(200).json({ errorMessage: 'Login process went successful' });
        }
        else {
            res.status(401).json({ errorMessage: userData.error });
        }
    }
    catch (err) {
        logger.error(`Error during login process`, err);
    }
    finally {
        res.end();
    }
}));
export default router;
//# sourceMappingURL=auth.js.map