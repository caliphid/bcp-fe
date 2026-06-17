import { Role, Status } from './common';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface AuthResponse {
  message: string;
  data: LoginResponse;
}
