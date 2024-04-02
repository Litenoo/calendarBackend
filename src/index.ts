require('dotenv').config();
import express from "express";
import session from "express-session";
import cors from "cors";

const app = express();
app.use(cors());
const number = 2 * 2 + 2;

app.use(session({
  secret: "password", // change to env file later
  saveUninitialized: true,
  resave: false,
}));

app.get('/', (req, res) => {
  console.log("request handled !");
  res.json({ data : number });
  res.end();
});

app.listen(3000, () => {
  console.log("server is listening on port : 3000");
}); 