import logger from '../logger.js';
export async function pushTask(pool, data) {
    console.log(data);
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