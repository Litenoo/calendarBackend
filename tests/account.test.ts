import 'dotenv/config';
import mariaDB from 'mariadb';
import jwt from 'jsonwebtoken';
import {createUser, login, getUserByEmail} from '../src/accountFunctions';
import {SessionResponse} from "../src/userInterfaces";

const pool = mariaDB.createPool({ //WARNING connected database gets empty every test run.
  host: "127.0.0.1",
  port: 3306,
  user: 'root',
  password: process.env.DATABASE_PASSWORD,
  database: 'testCalendarApp',
  connectionLimit: 10,
});

async function killConnectionDB(): Promise<void> {
  await pool.query("DELETE FROM users");
  await pool.end();
}

test('Registration system - Creating new account works properly', async () => {
  const registerData = await createUser({
    email: 't@t',
    password: 't',
    username: 't',
  }, pool);

  expect(registerData).toMatchObject({registerSuccess: true});
  const response = await getUserByEmail('t@t', pool);
  expect(response).toMatchObject({email: 't@t', username: 't'});

});

test('Login system - User validation and JWT token are working properly', async () => {
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

  //Case 1 - Wrong email
  let user: SessionResponse = await login(notValidUserData, pool);

  expect(user.error).toEqual('There is no user with given email.');
  expect(user.email).toEqual(undefined);
  expect(user.id).toBeFalsy();

  //Case 2 - Wrong password
  user = await login(notValidUserData2, pool);

  expect(user.error).toEqual('Wrong password.');
  expect(user.email).toEqual(undefined);
  expect(user.id).toBeFalsy();

  //Case 3 - Correct login data
  user = await login(validLoginData, pool);

  console.log('USER : ', user)

  expect(user.error).toEqual(undefined);
  expect(user.email).toEqual('t@t');
  expect(user.id).toBeTruthy();

  await killConnectionDB();
});
