import api from '../../lib/axios';
import { BaseResponse, ListResponse } from '../../types/common';
import { Account } from '../../types/account';
import { buildQueryString } from '../../lib/query';

export const accountsApi = {
  getAccounts: async (params?: Record<string, any>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<ListResponse<Account>>(`/accounts${query}`);
    return res.data;
  },
  getAccountById: async (id: string) => {
    const res = await api.get<BaseResponse<Account>>(`/accounts/${id}`);
    return res.data;
  },
  createAccount: async (data: any) => {
    const res = await api.post<BaseResponse<Account>>('/accounts', data);
    return res.data;
  },
  updateAccount: async (id: string, data: any) => {
    const res = await api.patch<BaseResponse<Account>>(`/accounts/${id}`, data);
    return res.data;
  },
  activateAccount: async (id: string) => {
    const res = await api.patch<BaseResponse<Account>>(`/accounts/${id}/activate`);
    return res.data;
  },
  deactivateAccount: async (id: string) => {
    const res = await api.patch<BaseResponse<Account>>(`/accounts/${id}/deactivate`);
    return res.data;
  },
};
