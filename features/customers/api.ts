import api from '../../lib/axios';
import { BaseResponse, ListResponse } from '../../types/common';
import { buildQueryString } from '../../lib/query';
import {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerAddress,
  CreateCustomerAddressRequest,
  UpdateCustomerAddressRequest,
  MergeCustomerRequest,
  CustomerDuplicateCandidate,
  ReviewDuplicateRequest,
  BackfillSalesOrdersRequest,
  BackfillSalesOrdersResponse
} from '../../types/customer';

export const customerApi = {
  getCustomers: async (params?: Record<string, any>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<ListResponse<Customer>>(`/customers${query}`);
    return res.data;
  },

  getCustomerById: async (id: string) => {
    const res = await api.get<BaseResponse<Customer>>(`/customers/${id}`);
    return res.data;
  },

  createCustomer: async (data: CreateCustomerRequest) => {
    const res = await api.post<BaseResponse<Customer>>('/customers', data);
    return res.data;
  },

  updateCustomer: async (id: string, data: UpdateCustomerRequest) => {
    const res = await api.patch<BaseResponse<Customer>>(`/customers/${id}`, data);
    return res.data;
  },

  addCustomerAddress: async (customerId: string, data: CreateCustomerAddressRequest) => {
    const res = await api.post<BaseResponse<CustomerAddress>>(`/customers/${customerId}/addresses`, data);
    return res.data;
  },

  updateCustomerAddress: async (customerId: string, addressId: string, data: UpdateCustomerAddressRequest) => {
    const res = await api.patch<BaseResponse<CustomerAddress>>(`/customers/${customerId}/addresses/${addressId}`, data);
    return res.data;
  },

  mergeCustomer: async (id: string, data: MergeCustomerRequest) => {
    const res = await api.post<BaseResponse<Customer>>(`/customers/${id}/merge`, data);
    return res.data;
  },

  getCustomerDuplicates: async (params?: Record<string, any>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<ListResponse<CustomerDuplicateCandidate>>(`/customers/duplicates${query}`);
    return res.data;
  },

  reviewCustomerDuplicate: async (id: string, data: ReviewDuplicateRequest) => {
    const res = await api.patch<BaseResponse<CustomerDuplicateCandidate>>(`/customers/duplicates/${id}`, data);
    return res.data;
  },

  backfillSalesOrders: async (data: BackfillSalesOrdersRequest) => {
    const res = await api.post<BaseResponse<BackfillSalesOrdersResponse>>('/customers/backfill-sales-orders', data);
    return res.data;
  }
};
