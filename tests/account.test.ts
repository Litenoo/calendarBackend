import 'dotenv/config';
import {createUser, login, getUserByEmail} from '../src/middleware/accountFunctions';
import {SessionResponse} from "../src/userInterfaces";

import pool from "../src/dbPool";


async function killConnectionDB(): Promise<void> {
  await pool.query("DELETE FROM users");
  await pool.end();
}

test('Registration system - Creating new account works properly', async () => {
  const registerData = await createUser(pool, {
    email: 't@t',
    password: 't',
    username: 't',
  });

  expect(registerData).toMatchObject({registerSuccess: true});
  const response = await getUserByEmail(pool, 't@t');
  expect(response).toMatchObject({email: 't@t', username: 't'});

});

test('Login system - User validation and sessions are working properly', async () => {
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
  let user: SessionResponse = await login(pool, notValidUserData);

  expect(user.error).toEqual('There is no user with given email.');
  expect(user.email).toEqual(undefined);
  expect(user.id).toBeFalsy();

  //Case 2 - Wrong password
  user = await login(pool, notValidUserData2);

  expect(user.error).toEqual('Wrong password.');
  expect(user.email).toEqual(undefined);
  expect(user.id).toBeFalsy();

  //Case 3 - Correct login data
  user = await login(pool, validLoginData);

  expect(user.error).toEqual(undefined);
  expect(user.email).toEqual('t@t');
  expect(user.id).toBeTruthy();

  await killConnectionDB();
});
