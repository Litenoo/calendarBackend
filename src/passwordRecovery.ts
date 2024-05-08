import 'dotenv/config';
import randomString from 'randomstring';

export async function createRecoveryToken(email: string, pool) { //dev add check if already Token exists. If yes delete it.
  let conn;
  try {
    const recoveryToken: string = randomString.generate(48);
    conn = await pool.getConnection();
    await conn.query('DELETE FROM tokens WHERE email = ?', [email]);
    await conn.query('INSERT INTO tokens (email, token) VALUES (?,?)', [email, recoveryToken]);
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.end();
  }
}

export async function getRecoveryToken(userData, pool) {
  let conn;
  try {
    conn = await pool.getConnection();
    const token = await pool.query('SELECT token FROM tokens WHERE email = ?', [userData.email]);
    if (token) {
      return token[0].token;
    } else {
      return null;
    }
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.end();
  }
}

export async function getEmailByToken(pool, inputToken: string) {
  let conn;
  try {
    conn = await pool.getConnection();
    const email = await pool.query('SELECT email FROM tokens WHERE token = ? LIMIT 1', [inputToken]);
    if (email) {
      return email[0];
    } else {
      return null;
    }
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.end();
  }
}