var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import 'dotenv/config';
import bcrypt from "bcrypt";
import logger from '../logger.js';
export function getUserByEmail(pool, email) {
    return __awaiter(this, void 0, void 0, function* () {
        let conn;
        try {
            conn = yield pool.getConnection();
            const user = yield conn.query('SELECT email, password, username, id FROM users WHERE email = ? LIMIT 1', [email]);
            return user[0];
        }
        catch (err) {
            return null;
        }
        finally {
            if (conn)
                conn.end();
        }
    });
}
export function checkUsrExists(pool, email) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield getUserByEmail(pool, email);
        return !!user;
    });
}
export function createUser(pool, user) {
    return __awaiter(this, void 0, void 0, function* () {
        let conn;
        try {
            const userExist = yield checkUsrExists(pool, user.email);
            if (!userExist) {
                conn = yield pool.getConnection();
                const hash = yield bcrypt.hash(user.password, 10);
                yield conn.query('INSERT INTO users (email, password, username) VALUES (?,?,?)', [user.email, hash, user.username]);
                return { registerSuccess: true };
            }
            else {
                return { registerSuccess: false, errorMessage: "There is already user with that email." };
            }
        }
        catch (err) {
            return { registerSuccess: false, errorMessage: `${err} --> Please contact with website administrator` };
        }
        finally {
            if (conn)
                conn.end();
        }
    });
}
export function login(pool, loginData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let user = yield getUserByEmail(pool, loginData.email);
            if (user) {
                const result = yield bcrypt.compare(loginData.password, user.password);
                if (result) {
                    return { id: user.id, email: user.email };
                }
                else {
                    return { error: 'Wrong password.' };
                }
            }
            return { error: 'There is no user with given email.' };
        }
        catch (err) {
            logger.error("Error during the login", err);
            return { error: 'There was an error occurred. Please contact with server administrator or retry.' };
        }
    });
}
export function getUserById(pool, id) {
    return __awaiter(this, void 0, void 0, function* () {
        let conn;
        try {
            conn = yield pool.getConnection();
            const user = yield conn.query('SELECT email, username FROM users WHERE id = ? LIMIT 1', [id]);
            return { user: user[0] };
        }
        catch (err) {
            return { user: null };
        }
        finally {
            if (conn)
                conn.end();
        }
    });
}
export function changePassword(pool, userData) {
    return __awaiter(this, void 0, void 0, function* () {
        let conn;
        try {
            conn = yield pool.getConnection();
            const hash = yield bcrypt.hash(userData.password, 10);
            yield conn.query('UPDATE users SET password = ? WHERE email = ?', [hash, userData.email]);
        }
        catch (err) {
            logger.error("Error during the password changing", err);
            console.log(err);
        }
        finally {
            if (conn)
                conn.end();
        }
    });
}
//# sourceMappingURL=accountFunctions.js.map