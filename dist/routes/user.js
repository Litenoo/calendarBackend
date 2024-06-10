var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { changePassword, getUserByEmail, getUserById } from "../middleware/accountFunctions.js";
import { getEmailByToken, getRecoveryToken, sendRecoveryCode } from "../middleware/passwordRecovery.js";
import express from "express";
import pool from '../dbPool.js';
import cors from "cors";
import logger from '../logger.js';
const router = express.Router();
router.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
router.post('/userData', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userData = yield getUserById(pool, req.cookies.userId.id);
        res.json(userData.user);
    }
    catch (err) {
        res.status(403);
        res.send('No cookie');
    }
    finally {
        res.end();
    }
}));
router.post('/passwordRecoveryToken', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const account = yield getUserByEmail(pool, req.body.email);
    if (account) {
        yield sendRecoveryCode(pool, req.body.email);
    }
    res.status(200);
}));
router.post('/checkRecoveryToken', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = yield getEmailByToken(pool, req.body.token);
        if (email) {
            res.status(200);
            res.json({ "errorMessage": null });
        }
        else {
            res.status(403);
            res.json({ "errorMessage": 'Token is not valid' });
        }
    }
    catch (err) {
        res.status(403);
        res.send('No token !');
    }
    finally {
        res.end();
    }
}));
router.post('/changePassword', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = yield getEmailByToken(pool, req.body.token);
        const token = yield getRecoveryToken(email, pool);
        if (token === req.body.token) {
            console.log('handler : updating user with email : ', email.email, 'changing password to : ', req.body.password);
            yield changePassword(pool, { email: email.email, password: req.body.password });
        }
        else {
            res.status(404);
            res.send('Access denied. Please contact with service administrator.');
        }
    }
    catch (err) {
        logger.error(`Error during changePassword endpoint`, err);
        res.status(503);
        res.send('Service not available. Please contact with service administrator.');
    }
    finally {
        res.end();
    }
}));
export default router;
//# sourceMappingURL=user.js.map