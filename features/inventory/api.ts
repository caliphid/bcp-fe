import api from '../../lib/axios';
import { BaseResponse, ListResponse } from '../../types/common';
import { 
  InventoryStock, 
  InventoryMovement, 
  OpeningStockRequest, 
  StockAdjustmentRequest 
} from '../../types/inventory';

export const inventoryApi = {
  getInventoryStock: async (params?: Record<string, any>) => {
    const res = await api.get<ListResponse<InventoryStock>>('/inventory/stock', { params });
    return res.data;
  },

  getInventoryStockByVariant: async (productVariantId: string) => {
    const res = await api.get<BaseResponse<InventoryStock>>(`/inventory/stock/${productVariantId}`);
    return res.data;
  },

  getLowStock: async (params?: Record<string, any>) => {
    const res = await api.get<ListResponse<InventoryStock>>('/inventory/low-stock', { params });
    return res.data;
  },

  getInventoryMovements: async (params?: Record<string, any>) => {
    const res = await api.get<ListResponse<InventoryMovement>>('/inventory/movements', { params });
    return res.data;
  },

  createOpeningStock: async (data: OpeningStockRequest) => {
    const res = await api.post<BaseResponse<void>>('/inventory/opening-stock', data);
    return res.data;
  },

  createStockAdjustment: async (data: StockAdjustmentRequest) => {
    const res = await api.post<BaseResponse<void>>('/inventory/adjustments', data);
    return res.data;
  }
};
