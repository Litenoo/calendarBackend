export interface User {
    email:string;
    password:string;
    username:string;
}
export interface RegisterResponse{
    registerSuccess:boolean,
    errorMessage?:any
}
export interface SessionResponse{
    id?:number;
    username?:string;
    email?:string;
    error?:string;
}
export interface DBuserOutput {
    email:string;
    password:string;
    username:string;
    id:number;
}
export interface User{
    email:string,
    password:string,
}