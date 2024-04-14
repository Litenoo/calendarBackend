export interface User {
    email:string;
    password:string;
    username:string;
}
export interface RegisterResponse{
    registerSuccess:boolean,
    error?:any
}
export interface SessionResponse{
    email?:string,
    username?:string,
    error?:string,
}
export interface DBuserOutput {
    email:string;
    password:string;
    username:string;
}