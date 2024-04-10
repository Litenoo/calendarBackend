import mariaDB from 'mariadb';
import {createUser} from '../src/accountFunctions';

const pool = mariaDB.createPool({
  host: "127.0.0.1",
  port: 3306,
  user: 'root',
  password: 'Pikachu531',
  database: 'testCalendarApp',
  connectionLimit: 10,
})

async function getUser (email){
  let response = await pool.query('SELECT email, username FROM users WHERE email = ?', [email]);
  return response;
}

test('registration process system works correctly', async () => {
  const registerInfo = await createUser({
    email:'t@t',
    password: 't',
    username:'t',
  }, pool);

  console.log('+++++++++++++++++++++++++++++' + JSON.stringify(registerInfo));

  await expect(registerInfo).toMatchObject({registerSucces:true});
  const response = await getUser('t@t');
  await expect(response[0]).toMatchObject({email:'t@t', username:'t'});

});
