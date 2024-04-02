"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const number = 2 * 2 + 2;
app.use((0, express_session_1.default)({
    secret: "password",
    saveUninitialized: true,
    resave: false,
}));
app.get('/', (req, res) => {
    console.log("request handled !");
    res.json({ data: number });
    res.end();
});
app.listen(3000, () => {
    console.log("server is listening on port : 3000");
});
//# sourceMappingURL=index.js.map