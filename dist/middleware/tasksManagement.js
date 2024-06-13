import logger from '../logger.js';
export async function pushTask(pool, task, userId) {
    let conn;
    try {
        const { title, color, duration, priority, status } = task;
        let date = task.date.toString();
        let dateArray = date.split('-');
        const dateObject = { year: dateArray[0], month: dateArray[1], day: dateArray[2] };
        console.log("date : ", dateObject);
        conn = await pool.getConnection();
        return await conn.query("INSERT INTO tasks (userId, title, color, duration, date, priority, status) VALUES (?,?,?,?,?,?,?)", [userId, title, color, JSON.stringify(duration), JSON.stringify(dateObject), priority, status]);
    }
    catch (err) {
        logger.error("Error during pushing task", err);
    }
}
export async function removeTask(pool, taskId) {
}
export async function pullTasksList(pool, userId, month, year) {
    let conn;
    try {
        conn = await pool.getConnection();
        return await conn.query("SELECT title, duration, date, priority, status, color, id " +
            "FROM tasks WHERE userID = ? AND JSON_EXTRACT(date, '$.month') = ? AND JSON_EXTRACT(date, '$.year') = ?", [userId, month, year]);
    }
    catch (err) {
        logger.error("Error during tasks pull", err);
    }
    finally {
        if (conn)
            conn.end();
    }
}
//# sourceMappingURL=tasksManagement.js.map