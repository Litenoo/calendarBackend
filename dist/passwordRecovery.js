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
import randomString from 'randomstring';
export function createRecoveryToken(email, pool) {
    return __awaiter(this, void 0, void 0, function* () {
        let conn;
        try {
            const recoveryToken = randomString.generate(48);
            conn = yield pool.getConnection();
            yield conn.query('DELETE FROM tokens WHERE email = ?', [email]);
            yield conn.query('INSERT INTO tokens (email, token) VALUES (?,?)', [email, recoveryToken]);
        }
        catch (err) {
            console.log(err);
        }
        finally {
            if (conn)
                conn.end();
        }
    });
}
export function getRecoveryToken(email, pool) {
    return __awaiter(this, void 0, void 0, function* () {
        let conn;
        try {
            conn = yield pool.getConnection();
            const token = yield pool.query('SELECT token FROM tokens WHERE email = ? LIMIT 1', [email]);
            if (token) {
                return token[0];
            }
            else {
                return null;
            }
        }
        catch (err) {
            console.log(err);
        }
        finally {
            if (conn)
                conn.end();
        }
    });
}
//# sourceMappingURL=passwordRecovery.js.map