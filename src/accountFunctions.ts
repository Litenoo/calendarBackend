import {User} from "./userInterface";
import bcrypt from "bcrypt";
import {registerResponse} from "./userInterface";

export async function getUserByEmail(email, pool) {
  const user: User = await pool.query('SELECT email, password, username FROM users WHERE email = ? LIMIT 1', [email]);
  return user;
}

export async function createUser(user: User, pool): Promise<registerResponse> {
  let conn;
  try {
    conn = await pool.getConnection();
    const hash = await bcrypt.hash(user.password, 10);
    console.log('Query variables :',user.email, hash, user.username); //Wszystkie wartości są prawidłowe
    //Funkcja zatrzymuje się tutaj
    const result = await conn.query(
      'INSERT INTO users (email, password, username) VALUES (?,?,?)',
      [user.email, hash, user.username]
    );
    console.log(result);
    if (conn) conn.end();
    return {registerSucces: true};
  } catch (err) {
    if (conn) conn.end();
    return {registerSucces: false, error: err};
  }
}

export async function login(loginData, pool) {
  let user = await getUserByEmail(loginData.email, pool);
  console.log(user);
  if (user) {
    bcrypt.compare(loginData.password, user.password, (error, result) => {
      if (error) {
        return {err: 'There was an error occurred. Please contact with server administrator'}
      }
      if (result) {
        return {email: user.email, username: user.username};
      }
    });
  } else {
    return {err: 'There is no user with given email.'}
  }
}

export async function isAuth() {

}