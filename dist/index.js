import 'dotenv/config';
import express from "express";
import session from "express-session";
import cors from "cors";
import mariaDB from "mariadb";
const app = express();
app.use(cors());
app.use(session({
    secret: "password",
    saveUninitialized: true,
    resave: false,
}));
const pool = mariaDB.createPool({
    connectionLimit: 10,
    host: "127.0.0.1",
    port: 3306,
    user: 'root',
    password: 'Pikachu531',
    database: 'calendarApp',
});
async function getUser() {
    const user = await pool.query('SELECT email, password, username FROM users LIMIT 1');
    return user;
}
const users = await getUser();
console.log(users);
app.get('/', (req, res) => {
    res.end();
});
app.listen(3000, () => {
    console.log("server is listening on port : 3000");
});
//# sourceMappingURL=index.js.map