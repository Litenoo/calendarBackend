import mariaDB from "mariadb";
const pool = mariaDB.createPool({
    host: "127.0.0.1",
    port: 3306,
    user: 'root',
    password: process.env.MYSQL_PASSWORD,
    database: 'calendarApp',
    connectionLimit: 10,
});
export default pool;
//# sourceMappingURL=dbPool.js.map