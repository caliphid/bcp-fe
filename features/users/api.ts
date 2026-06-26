import api from '../../lib/axios';
import { UserResponse, UsersResponse } from '../../types/user';

export const usersApi = {
  getUsers: async (params?: Record<string, any>) => {
    const res = await api.get<UsersResponse>('/users', { params });
    return res.data;
  },
  createUser: async (data: any) => {
    const res = await api.post<UserResponse>('/users', data);
    return res.data;
  },
  updateUser: async (id: string, data: any) => {
    const res = await api.patch<UserResponse>(`/users/${id}`, data);
    return res.data;
  },
  deactivateUser: async (id: string) => {
    const res = await api.patch<UserResponse>(`/users/${id}/deactivate`);
    return res.data;
  },
  activateUser: async (id: string) => {
    const res = await api.patch<UserResponse>(`/users/${id}/activate`);
    return res.data;
  },
};
