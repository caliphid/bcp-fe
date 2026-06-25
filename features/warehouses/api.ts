import api from '../../lib/axios';
import { BaseResponse, ListResponse } from '../../types/common';
import { Warehouse, CreateWarehouseRequest, UpdateWarehouseRequest } from '../../types/warehouse';

export const warehouseApi = {
  getWarehouses: async (params?: Record<string, any>) => {
    const res = await api.get<ListResponse<Warehouse>>('/warehouses', { params });
    return res.data;
  },

  getWarehouseById: async (id: string) => {
    const res = await api.get<BaseResponse<Warehouse>>(`/warehouses/${id}`);
    return res.data;
  },

  createWarehouse: async (data: CreateWarehouseRequest) => {
    const res = await api.post<BaseResponse<Warehouse>>('/warehouses', data);
    return res.data;
  },

  updateWarehouse: async (id: string, data: UpdateWarehouseRequest) => {
    const res = await api.patch<BaseResponse<Warehouse>>(`/warehouses/${id}`, data);
    return res.data;
  },

  activateWarehouse: async (id: string) => {
    const res = await api.patch<BaseResponse<Warehouse>>(`/warehouses/${id}/activate`);
    return res.data;
  },

  deactivateWarehouse: async (id: string) => {
    const res = await api.patch<BaseResponse<Warehouse>>(`/warehouses/${id}/deactivate`);
    return res.data;
  }
};
