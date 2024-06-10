var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import logger from '../logger';
export function pushTask(pool, data) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(data);
    });
}
export function removeTask(pool, taskId) {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
export function pullTasksList(pool, userId, month, year) {
    return __awaiter(this, void 0, void 0, function* () {
        let conn;
        try {
            conn = yield pool.getConnection();
            return yield conn.query("SELECT title, duration, date, priority, status, color, id " +
                "FROM tasks WHERE userID = ? AND JSON_EXTRACT(date, '$.month') = ? AND JSON_EXTRACT(date, '$.year') = ?", [userId, month, year]);
        }
        catch (err) {
            logger.error("Error during tasks pull", err);
        }
        finally {
            if (conn)
                conn.end();
        }
    });
}
//# sourceMappingURL=tasksManagement.js.map