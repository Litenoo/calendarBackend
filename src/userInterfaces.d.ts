export interface User {
    email:string;
    password:string;
    username:string;
}
export interface RegisterResponse{
    registerSuccess:boolean,
    error?:any
}
export interface JwtPayload{
    jwt?:string,
    error?:string,
}
export interface DBuserOutput {
    email:string;
    password:string;
    username:string;
}