import mariaDB from 'mariadb';
import {createUser, login} from '../src/accountFunctions';

const pool = mariaDB.createPool({ //WARNING connected database gets empty every test run.
  host: "127.0.0.1",
  port: 3306,
  user: 'root',
  password: 'Pikachu531',
  database: 'testCalendarApp',
  connectionLimit: 10,
})

async function getUser(email) {
  let [response] = await pool.query('SELECT email, username FROM users WHERE email = ?', [email]);
  return response;
}

async function killConnectionDB(): Promise<void> {
  await pool.query("DELETE FROM users");
  await pool.end();
}

test('registration system works correctly', async () => {
  const registerData = await createUser({
    email: 't@t',
    password: 't',
    username: 't',
  }, pool);

  expect(registerData).toMatchObject({registerSuccess: true});
  const response = await getUser('t@t');
  expect(response).toMatchObject({email: 't@t', username: 't'});

});

test('login system works correctly', async () => {
  const notValidUserData = {
    email: 'f@f',
    password: 't',
    username: 't',
  }
  const notValidUserData2 = {
    email: 't@t',
    password: 'q',
    username: 't',
  }
  const validLoginData = {
    email: 't@t',
    password: 't',
    username: 't',
  }

  let user = await login(notValidUserData, pool);
  expect(user.error).toEqual('There is no user with given email.');
  expect(user.username).toEqual(undefined);
  expect(user.email).toEqual(undefined);

  user = await login(notValidUserData2, pool);
  expect(user.error).toEqual('There is no user with given email.');
  expect(user.username).toEqual(undefined);
  expect(user.email).toEqual(undefined);


  user = await login(validLoginData, pool);
  expect(user.error).toEqual(undefined);
  expect(user.username).toEqual(validLoginData.username);
  expect(user.email).toEqual(validLoginData.email);

  await killConnectionDB();
});

