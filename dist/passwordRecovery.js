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
import randomstring from 'randomstring';
function createRecoveryToken() {
    try {
        return randomstring.generate(48);
    }
    catch (err) {
        console.log(err);
    }
}
function saveRecoveryToken(pool, email, recoveryToken) {
    return __awaiter(this, void 0, void 0, function* () {
        let conn;
        try {
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
export function getRecoveryToken(userData, pool) {
    return __awaiter(this, void 0, void 0, function* () {
        let conn;
        try {
            conn = yield pool.getConnection();
            const token = yield pool.query('SELECT token FROM tokens WHERE email = ?', [userData.email]);
            if (token) {
                return token[0].token;
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
export function getEmailByToken(pool, inputToken) {
    return __awaiter(this, void 0, void 0, function* () {
        let conn;
        try {
            conn = yield pool.getConnection();
            const email = yield pool.query('SELECT email FROM tokens WHERE token = ? LIMIT 1', [inputToken]);
            if (email) {
                return email[0];
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
export function sendRecoveryCode(pool, usersEmail) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const recoveryToken = createRecoveryToken();
            yield saveRecoveryToken(pool, usersEmail, recoveryToken);
            const recoveryLink = 'http://localhost:5173/changePassword?token=' + recoveryToken;
            yield fetch(' https://api.mailersend.com/v1/email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Authorization': `Bearer ${process.env.MAIL_API_KEY}`,
                },
                body: JSON.stringify({
                    'from': {
                        'email': `${process.env.MAIL_SENDER}`
                    },
                    'to': [
                        {
                            'email': `${usersEmail}`
                        }
                    ],
                    'subject': 'Password Recovery for your calendarApp account',
                    'personalization': [
                        {
                            'email': `${usersEmail}`,
                            'data': {
                                'name': 'support noreply',
                                'account_name': 'noreply',
                                'support_email': 'supportCalendarApp@example.com',
                                'link': `${recoveryLink}`,
                            }
                        }
                    ],
                    'template_id': `${process.env.RECOVERY_TEMPLATE_ID}`,
                })
            });
        }
        catch (err) {
            console.log(err);
        }
    });
}
//# sourceMappingURL=passwordRecovery.js.map