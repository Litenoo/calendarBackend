import 'dotenv/config';
import randomstring from 'randomstring';
import logger from '../logger.js';

// Probably issue with package
// @ts-ignore
function createRecoveryToken() : string {
  try {
    return randomstring.generate(48);
  } catch (err) {
    logger.error(`Error during the "createRecoveryToken" middleware`, err);
  }
}

async function saveRecoveryToken(pool, email:string, recoveryToken:string){
  let conn;
  try{
    conn = await pool.getConnection();
    await conn.query('DELETE FROM tokens WHERE email = ?', [email]);
    await conn.query('INSERT INTO tokens (email, token) VALUES (?,?)', [email, recoveryToken]);
  }catch(err){
    logger.error(`Error during the "SaveRecoveryToken middleware"`, err);
  }finally{
    if(conn) conn.end();
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
    logger.error(`Error during the "getRecoveryToken" middleware"`, err);
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
      console.log('getEmailByToken : ', email, 'token :', inputToken)
      return email[0];
    } else {
      return null;
    }
  } catch (err) {
    logger.error(`Error during the "getEmailByToken middleware"`, err);
  } finally {
    if (conn) conn.end();
  }
}

export async function sendRecoveryCode(pool, usersEmail : string){
  try {
    const recoveryToken = createRecoveryToken();
    await saveRecoveryToken(pool, usersEmail, recoveryToken);
    const recoveryLink = 'http://localhost:5173/changePassword?token=' + recoveryToken;

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
  } catch (err) {
    logger.error("Error during recovery code email sending", err);
  }
}