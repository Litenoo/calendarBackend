export interface User {
    email:string;
    password:string;
    username:string;
}
export interface registerResponse{
    registerSuccess:boolean,
    error?:any
}
export interface loginResponse{
    error?:string,
    username?:string,
    email?:string
}