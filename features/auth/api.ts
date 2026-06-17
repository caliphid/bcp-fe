import api from '../../lib/axios';
import { AuthResponse, User } from '../../types/auth';
import { BaseResponse } from '../../types/common';

export const authApi = {
  registerOwner: async (data: any) => {
    const res = await api.post<BaseResponse<User>>('/auth/register-owner', data);
    return res.data;
  },
  login: async (data: any) => {
    const res = await api.post<AuthResponse>('/auth/login', data);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get<BaseResponse<User>>('/auth/me');
    return res.data;
  },
};
