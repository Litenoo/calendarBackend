import logger from '../logger.js';
export async function pushTask(pool, task, userId) {
    let conn;
    try {
        if (!userId) {
            const { title, color, duration, priority, status } = task;
            let date = task.date;
            conn = await pool.getConnection();
            return await conn.query("INSERT INTO tasks (userId, title, color, duration, date, priority, status) VALUES (?,?,?,?,?,?,?)", [userId, title, color, JSON.stringify(duration), JSON.stringify(date), priority, status]);
        }
        else {
        }
    }
    catch (err) {
        logger.error("Error during pushing task", err);
    }
}
export async function pullTasksList(pool, taskQuery) {
    let conn;
    try {
        conn = await pool.getConnection();
        const { userId, year, month } = taskQuery;
        console.log("usrID = ", userId, "year = ", year, "month = ", month);
        return await conn.query(`SELECT title, duration, date, priority, status, color, id
        FROM tasks
        WHERE userID = ?
        AND JSON_EXTRACT(date, '$.year') = ?
        AND (
            JSON_EXTRACT(date, '$.month') = ?
            OR JSON_EXTRACT(date, '$.month') = ?
            OR JSON_EXTRACT(date, '$.month') = ?
        );
`, [userId, year, month, month + 1, month - 1]);
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