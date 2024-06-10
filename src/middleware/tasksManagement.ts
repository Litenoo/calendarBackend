import { Task } from '../userInterfaces';
//@ts-ignore
import logger from '../logger'


// DEV IMPORTANT ! make verification for tasks. check token or something.
export async function pushTask (pool, data : Task){
  console.log(data);
}

export async function removeTask(pool, taskId){

}

export async function pullTasksList(pool, userId: Number, month : Number, year : Number){
  let conn;
  try{
    conn = await pool.getConnection();
    return await conn.query(
      "SELECT title, duration, date, priority, status, color, id " +
      "FROM tasks WHERE userID = ? AND JSON_EXTRACT(date, '$.month') = ? AND JSON_EXTRACT(date, '$.year') = ?",
      [userId, month, year],
    );
  }catch(err){
    logger.error("Error during tasks pull", err);
  }finally {
    if(conn) conn.end();
  }
}