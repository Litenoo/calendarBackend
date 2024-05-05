import 'dotenv/config';
import bcrypt from "bcrypt";

import {RegisterResponse, SessionResponse, User, DBuserOutput} from "./userInterfaces";

export async function getUserByEmail(email, pool): Promise<DBuserOutput | null> {
  let conn;
  try {
    conn = await pool.getConnection();
    const user = await conn.query('SELECT email, password, username, id FROM users WHERE email = ? LIMIT 1', [email]);
    return user[0];
  } catch (err) {
    return null;
  } finally {
    if (conn) conn.end();
  }
}

export async function createUser(user: User, pool): Promise<RegisterResponse> {
  let conn;
  try {
    const userExist: User | null = await getUserByEmail(user.email, pool);
    if (userExist !== null) {
      conn = await pool.getConnection();
      const hash = await bcrypt.hash(user.password, 10);
      await conn.query(
        'INSERT INTO users (email, password, username) VALUES (?,?,?)',
        [user.email, hash, user.username],
      );
      return {registerSuccess: true};
    } else {
      return {registerSuccess: false, error: "There is already user with that email."};
    }
  } catch (err) {
    return {registerSuccess: false, error: err};
  } finally {
    if(conn) conn.end();
  }
}

export async function login(loginData, pool): Promise<SessionResponse> {
  try {
    let user :DBuserOutput|null = await getUserByEmail(loginData.email, pool);
    if (user) {
      const result = await bcrypt.compare(loginData.password, user.password);
      if (result) {
        return {id: user.id, email:user.email};
      } else {
        return {error: 'Wrong password.'};
      }
    }
    return {error: 'There is no user with given email.'};
  } catch (err) {
    console.log(err);
    return {error: 'There was an error occurred. Please contact with server administrator or retry.'};
  }
}

export async function getUserById(id, pool): Promise<any> {
  let conn;
  try {
    conn = await pool.getConnection();
    const user = await conn.query('SELECT email, username FROM users WHERE id = ? LIMIT 1', [id]);
    return {user : user[0]};
  } catch (err) {
    return {user: null};
  } finally {
    if (conn) conn.end();
  }
}