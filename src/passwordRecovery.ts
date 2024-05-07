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

export async function getRecoveryToken(email: string, pool) {
  let conn;
  try {
    conn = await pool.getConnection();
    const token = await pool.query('SELECT token FROM tokens WHERE email = ? LIMIT 1', [email]);
    if (token) {
      return token[0];
    } else {
      return null;
    }
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.end();
  }
}