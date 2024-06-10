import mariaDB from "mariadb";

//dev make here database for tests in JEST, so it won't change data on main one.
const pool = mariaDB.createPool({
  host: "127.0.0.1",
  port: 3306,
  user: 'root',
  password: process.env.DATABASE_PASSWORD,
  database: 'calendarApp',
  connectionLimit: 10,
});

export default pool;