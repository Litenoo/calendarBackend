import {User} from "./userInterface";
import bcrypt from "bcrypt";
import {registerResponse, loginResponse} from "./userInterface";

export async function getUserByEmail(email, pool) { //Check if this works in 100%
  let conn;
  try {
    conn = await pool.getConnection();
    const user = await conn.query('SELECT email, password, username FROM users WHERE email = ? LIMIT 1', [email]); //add type here to [user]
    return user[0];
  } catch (err) {
    return null; //change to error catch
  }finally{
    if (conn) conn.end();
  }
}

export async function createUser(user: User, pool): Promise<registerResponse> {
  let conn;
  try {
    const doesUserExist :User|null = await getUserByEmail(user.email, pool);
    if (doesUserExist !== null) {
      conn = await pool.getConnection();
      const hash = await bcrypt.hash(user.password, 10);
      await conn.query(
        'INSERT INTO users (email, password, username) VALUES (?,?,?)',
        [user.email, hash, user.username]
      );
      if (conn) conn.end();
      return {registerSuccess: true};
    }else{
      if (conn) conn.end();
      return {registerSuccess: false, error: "There is already user with that email."};
    }
  } catch (err) {
    if (conn) conn.end();
    return {registerSuccess: false, error: err};
  }
}

export async function login(loginData, pool) : Promise<loginResponse> {
  try{
    let user = await getUserByEmail(loginData.email, pool);
    if (user) {
      const result = await bcrypt.compare(loginData.password, user.password);
      if (result) {
        return {email: user.email, username: user.username};
      }
    }
    return {error: 'There is no user with given email.'};
  }catch(err){
    console.log(err);
      return {error: 'There was an error occurred. Please contact with server administrator or retry.'};
  }

}