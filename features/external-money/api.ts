import api from "../../lib/axios";
import { buildQueryString } from "../../lib/query";
import { BaseResponse, ListResponse } from "../../types/common";
import {
  ExternalParty,
  CreateExternalPartyPayload,
  ReceivableItem,
  ReceivableDetail,
  CreateReceivablePayload,
  UpdateReceivablePayload,
  ReceivableCollection,
  ReceivableCollectionDetail,
  CreateCollectionPayload,
  ReceivableWriteOff,
  CreateWriteOffPayload,
  VoidPayload,
  ReceivableSummaryData,
  ReceivableByPartyItem,
  ReceivableByTypeItem,
  ReceivableAgingBucket,
} from "../../types/receivable";

export const externalMoneyApi = {
  // External Parties
  getExternalParties: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params as Record<string, unknown>)}` : "";
    const res = await api.get<ListResponse<ExternalParty>>(`/external-parties${query}`);
    return res.data;
  },

  getExternalParty: async (id: string) => {
    const res = await api.get<BaseResponse<ExternalParty>>(`/external-parties/${id}`);
    return res.data;
  },

  createExternalParty: async (data: CreateExternalPartyPayload) => {
    const res = await api.post<BaseResponse<ExternalParty>>("/external-parties", data);
    return res.data;
  },

  updateExternalParty: async (id: string, data: Partial<CreateExternalPartyPayload>) => {
    const res = await api.patch<BaseResponse<ExternalParty>>(`/external-parties/${id}`, data);
    return res.data;
  },

  activateExternalParty: async (id: string) => {
    const res = await api.patch<BaseResponse<{ id: string }>>(`/external-parties/${id}/activate`);
    return res.data;
  },

  deactivateExternalParty: async (id: string) => {
    const res = await api.patch<BaseResponse<{ id: string }>>(`/external-parties/${id}/deactivate`);
    return res.data;
  },

  // Receivables Analytics & Summaries
  getReceivablesSummary: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params as Record<string, unknown>)}` : "";
    const res = await api.get<BaseResponse<ReceivableSummaryData>>(`/receivables/summary${query}`);
    return res.data;
  },

  getReceivablesByParty: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params as Record<string, unknown>)}` : "";
    const res = await api.get<BaseResponse<ReceivableByPartyItem[]>>(`/receivables/by-party${query}`);
    return res.data;
  },

  getReceivablesByType: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params as Record<string, unknown>)}` : "";
    const res = await api.get<BaseResponse<ReceivableByTypeItem[]>>(`/receivables/by-type${query}`);
    return res.data;
  },

  getReceivablesOutstanding: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params as Record<string, unknown>)}` : "";
    const res = await api.get<ListResponse<ReceivableItem>>(`/receivables/outstanding${query}`);
    return res.data;
  },

  getReceivablesOverdue: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params as Record<string, unknown>)}` : "";
    const res = await api.get<ListResponse<ReceivableItem>>(`/receivables/overdue${query}`);
    return res.data;
  },

  getReceivablesAgingSummary: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params as Record<string, unknown>)}` : "";
    const res = await api.get<BaseResponse<ReceivableAgingBucket[]>>(`/receivables/aging-summary${query}`);
    return res.data;
  },

  // Receivables CRUD
  getReceivables: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params as Record<string, unknown>)}` : "";
    const res = await api.get<ListResponse<ReceivableItem>>(`/receivables${query}`);
    return res.data;
  },

  getReceivableDetail: async (id: string) => {
    const res = await api.get<BaseResponse<ReceivableDetail>>(`/receivables/${id}`);
    return res.data;
  },

  createReceivable: async (data: CreateReceivablePayload) => {
    const res = await api.post<BaseResponse<{ id: string }>>("/receivables", data);
    return res.data;
  },

  updateReceivable: async (id: string, data: UpdateReceivablePayload) => {
    const res = await api.patch<BaseResponse<{ id: string }>>(`/receivables/${id}`, data);
    return res.data;
  },

  voidReceivable: async (id: string, data: VoidPayload) => {
    const res = await api.patch<BaseResponse<{ id: string }>>(`/receivables/${id}/void`, data);
    return res.data;
  },

  closeReceivable: async (id: string) => {
    const res = await api.patch<BaseResponse<{ id: string }>>(`/receivables/${id}/close`);
    return res.data;
  },

  // Receivable Collections
  getReceivableCollections: async (id: string, params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params as Record<string, unknown>)}` : "";
    const res = await api.get<ListResponse<ReceivableCollection>>(`/receivables/${id}/collections${query}`);
    return res.data;
  },

  createCollection: async (id: string, data: CreateCollectionPayload) => {
    const res = await api.post<BaseResponse<{ collectionId: string }>>(`/receivables/${id}/collections`, data);
    return res.data;
  },

  getCollectionDetail: async (collectionId: string) => {
    const res = await api.get<BaseResponse<ReceivableCollectionDetail>>(`/receivable-collections/${collectionId}`);
    return res.data;
  },

  voidCollection: async (collectionId: string, data: VoidPayload) => {
    const res = await api.patch<BaseResponse<{ collectionId: string }>>(`/receivable-collections/${collectionId}/void`, data);
    return res.data;
  },

  // Receivable Write-Offs
  getReceivableWriteOffs: async (id: string, params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params as Record<string, unknown>)}` : "";
    const res = await api.get<ListResponse<ReceivableWriteOff>>(`/receivables/${id}/write-offs${query}`);
    return res.data;
  },

  createWriteOff: async (id: string, data: CreateWriteOffPayload) => {
    const res = await api.post<BaseResponse<{ writeOffId: string }>>(`/receivables/${id}/write-offs`, data);
    return res.data;
  },

  voidWriteOff: async (writeOffId: string, data: VoidPayload) => {
    const res = await api.patch<BaseResponse<{ writeOffId: string }>>(`/receivable-write-offs/${writeOffId}/void`, data);
    return res.data;
  },
};
