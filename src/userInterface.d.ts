export interface User {
    email:string;
    password:string;
    username:string;
}
export interface registerResponse{
    registerSucces:boolean,
    error?:any
}