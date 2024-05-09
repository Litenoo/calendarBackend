import 'dotenv/config';
import randomstring from 'randomstring';

// Probably issue with package
// @ts-ignore
function createRecoveryToken() : string {
  try {
    return randomstring.generate(48);
  } catch (err) {
    console.log(err);
  }
}

async function saveRecoveryToken(pool, email:string, recoveryToken:string){
  let conn;
  try{
    conn = await pool.getConnection();
    await conn.query('DELETE FROM tokens WHERE email = ?', [email]);
    await conn.query('INSERT INTO tokens (email, token) VALUES (?,?)', [email, recoveryToken]);
  }catch(err){
    console.log(err); //Winston
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

export async function sendRecoveryCode(pool, usersEmail : string){
  try {
    const recoveryToken = createRecoveryToken();
    await saveRecoveryToken(pool, usersEmail, recoveryToken);
    const recoveryLink = 'http://localhost:5173/changePassword?token=' + recoveryToken; // dev if it is possible change that to real one url + it's not needed to fetch 2 times same token

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
            'email': `${usersEmail}`, //replace with users email
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
    console.log(err);
  }
}