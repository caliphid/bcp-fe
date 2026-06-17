import { User } from './auth';
import { BaseResponse } from './common';

export type UsersResponse = BaseResponse<User[]>;
export type UserResponse = BaseResponse<User>;
