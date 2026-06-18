import api from '../../lib/axios';
import { BaseResponse } from '../../types/common';
import { buildQueryString } from '../../lib/query';
import { 
  PreviewCashflowImportResponse, 
  ExecuteCashflowImportResponse, 
  ImportBatchListResponse, 
  ImportBatchDetailResponse, 
  ImportRowListResponse, 
  CancelImportBatchResponse 
} from '../../types/import';

export const importsApi = {
  previewCashflow: async (formData: FormData) => {
    const res = await api.post<BaseResponse<PreviewCashflowImportResponse>>('/imports/cashflow/preview', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
  
  executeCashflow: async (batchId: string, data: { skipDuplicates: boolean; importOnlyValidRows: boolean }) => {
    const res = await api.post<BaseResponse<ExecuteCashflowImportResponse>>(`/imports/cashflow/${batchId}/execute`, data);
    return res.data;
  },
  
  getBatches: async (params?: Record<string, any>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<ImportBatchListResponse>(`/imports/cashflow/batches${query}`);
    return res.data;
  },
  
  getBatchDetail: async (batchId: string) => {
    const res = await api.get<ImportBatchDetailResponse>(`/imports/cashflow/batches/${batchId}`);
    return res.data;
  },
  
  getBatchRows: async (batchId: string, params?: Record<string, any>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<ImportRowListResponse>(`/imports/cashflow/batches/${batchId}/rows${query}`);
    return res.data;
  },
  
  cancelBatch: async (batchId: string) => {
    const res = await api.patch<BaseResponse<CancelImportBatchResponse>>(`/imports/cashflow/batches/${batchId}/cancel`);
    return res.data;
  }
};
