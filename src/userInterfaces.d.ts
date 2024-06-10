export interface User {
  email: string;
  password: string;
  username: string;
}

export interface RegisterResponse {
  registerSuccess: boolean,
  errorMessage?: any
}

export interface SessionResponse {
  id?: number;
  username?: string;
  email?: string;
  error?: string;
  token?: string;
}

export interface DBuserOutput {
  email: string;
  password: string;
  username: string;
  id: number;
  token: string;
}

export interface User {
  email: string,
  password: string,
}

export interface Task {
  task: {
    usersId:number,
    title: string,
    date: string
    durationStart: number,
    durationEnd: number,
  }
}