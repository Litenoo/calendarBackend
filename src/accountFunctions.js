import 'dotenv/config';
import bcrypt from "bcrypt";
import { createRecoveryToken, getRecoveryToken } from "./emailSystem/passwordRecovery";
export async function getUserByEmail(email, pool) {
    let conn;
    try {
        conn = await pool.getConnection();
        const user = await conn.query('SELECT email, password, username, id FROM users WHERE email = ? LIMIT 1', [email]);
        return user[0];
    }
    catch (err) {
        return null;
    }
    finally {
        if (conn)
            conn.end();
    }
}
export async function createUser(user, pool) {
    let conn;
    try {
        const userExist = await getUserByEmail(user.email, pool);
        if (userExist !== null) {
            conn = await pool.getConnection();
            const hash = await bcrypt.hash(user.password, 10);
            await conn.query('INSERT INTO users (email, password, username) VALUES (?,?,?)', [user.email, hash, user.username]);
            return { registerSuccess: true };
        }
        else {
            return { registerSuccess: false, error: "There is already user with that email." };
        }
    }
    catch (err) {
        return { registerSuccess: false, error: err };
    }
    finally {
        if (conn)
            conn.end();
    }
}
export async function login(loginData, pool) {
    try {
        let user = await getUserByEmail(loginData.email, pool);
        if (user) {
            const result = await bcrypt.compare(loginData.password, user.password);
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
        console.log(err);
        return { error: 'There was an error occurred. Please contact with server administrator or retry.' };
    }
}
export async function getUserById(id, pool) {
    let conn;
    try {
        conn = await pool.getConnection();
        const user = await conn.query('SELECT email, username FROM users WHERE id = ? LIMIT 1', [id]);
        return { user: user[0] };
    }
    catch (err) {
        return { user: null };
    }
    finally {
        if (conn)
            conn.end();
    }
}
export async function changePassword(pool, userData) {
    let conn;
    try {
        conn = await pool.getConnection();
        console.log('email : ', userData.email, 'password : ', userData.password);
        const hash = await bcrypt.hash(userData.password, 10);
        await conn.query('UPDATE users SET password = ? WHERE email = ?', [hash, userData.email]);
    }
    catch (err) {
        console.log(err);
    }
    finally {
        if (conn)
            conn.end();
    }
}
export async function sendRecoveryCode(pool, usersEmail) {
    try {
        await createRecoveryToken(usersEmail, pool);
        const recoveryToken = await getRecoveryToken(usersEmail, pool);
        const recoveryLink = 'http://localhost:5173/changePassword?token=' + recoveryToken.token;
        await fetch(' https://api.mailersend.com/v1/email', {
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
                'subject': 'Email Recovery for your calendarApp account',
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
}
