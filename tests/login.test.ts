import 'dotenv/config';
import mariaDB from 'mariadb';
import jwt from 'jsonwebtoken';
import {createUser, login, getUserByEmail} from '../src/accountFunctions';
import {JwtPayload} from "../src/userInterfaces";

const pool = mariaDB.createPool({ //WARNING connected database gets empty every test run.
  host: "127.0.0.1",
  port: 3306,
  user: 'root',
  password: 'Pikachu531',
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
  let user: JwtPayload = await login(notValidUserData, pool);

  expect(user.error).toEqual('There is no user with given email.');
  expect(user.jwt).toEqual(undefined);

  //Case 2 - Wrong password
  user = await login(notValidUserData2, pool);

  expect(user.error).toEqual('Wrong password.');
  expect(user.jwt).toEqual(undefined);

  //Case 3 - Correct login data
  user = await login(validLoginData, pool);
  const decodedToken = jwt.verify(user.jwt, process.env.JWT_SECRET);

  expect(user.error).toEqual(undefined);
  expect(decodedToken.username).toEqual(validLoginData.username);
  expect(decodedToken.email).toEqual(validLoginData.email);

  await killConnectionDB();
});
