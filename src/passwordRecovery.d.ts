import 'dotenv/config';
export declare function createRecoveryToken(email: string, pool: any): Promise<void>;
export declare function getRecoveryToken(userData: any, pool: any): Promise<any>;
export declare function getEmailByToken(pool: any, inputToken: string): Promise<any>;
//# sourceMappingURL=passwordRecovery.d.ts.map