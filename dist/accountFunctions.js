var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import bcrypt from "bcrypt";
export function getUserByEmail(email, pool) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield pool.query('SELECT email, password, username FROM users WHERE email = ? LIMIT 1', [email]);
        return user;
    });
}
export function createUser(user, pool) {
    return __awaiter(this, void 0, void 0, function* () {
        let conn;
        try {
            conn = yield pool.getConnection();
            const hash = yield bcrypt.hash(user.password, 10);
            console.log('Query variables :', user.email, hash, user.username);
            const result = yield conn.query('INSERT INTO users (email, password, username) VALUES (?,?,?)', [user.email, hash, user.username]);
            console.log(result);
            if (conn)
                conn.end();
            return { registerSucces: true };
        }
        catch (err) {
            if (conn)
                conn.end();
            return { registerSucces: false, error: err };
        }
    });
}
export function login(loginData, pool) {
    return __awaiter(this, void 0, void 0, function* () {
        let user = yield getUserByEmail(loginData.email, pool);
        console.log(user);
        if (user) {
            bcrypt.compare(loginData.password, user.password, (error, result) => {
                if (error) {
                    return { err: 'There was an error occurred. Please contact with server administrator' };
                }
                if (result) {
                    return { email: user.email, username: user.username };
                }
            });
        }
        else {
            return { err: 'There is no user with given email.' };
        }
    });
}
export function isAuth() {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
//# sourceMappingURL=accountFunctions.js.map