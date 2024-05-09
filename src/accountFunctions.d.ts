import 'dotenv/config';
import { RegisterResponse, SessionResponse, User, DBuserOutput } from "./userInterfaces";
export declare function getUserByEmail(email: string, pool: any): Promise<DBuserOutput | null>;
export declare function createUser(user: User, pool: any): Promise<RegisterResponse>;
export declare function login(loginData: User, pool: any): Promise<SessionResponse>;
export declare function getUserById(id: number, pool: any): Promise<any>;
export declare function changePassword(pool: any, userData: any): Promise<void>;
export declare function sendRecoveryCode(pool: any, usersEmail: string): Promise<void>;
//# sourceMappingURL=accountFunctions.d.ts.map