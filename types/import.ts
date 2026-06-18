import { PaginationMeta } from "./common";
import { Account } from "./account";
import { BusinessUnit } from "./business-unit";

export type ImportBatchStatus = "PREVIEWED" | "PROCESSING" | "COMPLETED" | "FAILED" | "PARTIAL_FAILED" | "CANCELLED";
export type ImportRowStatus = "VALID" | "INVALID" | "IMPORTED" | "SKIPPED" | "FAILED";

export interface SheetSummary {
  sheetName: string;
  month: number;
  totalRows: number;
  validRows: number;
  invalidRows: number;
}

export interface PreviewSampleRow {
  rowNumber: number;
  sheetName: string;
  transactionDate: string;
  description: string;
  type: string;
  amount: string;
  mappedCategoryName: string | null;
  status: ImportRowStatus;
  warningMessage: string | null;
  errorMessage: string | null;
}

export interface PreviewCashflowImportResponse {
  batchId: string;
  fileName: string;
  activeYear: number;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  skippedRows: number;
  sheets: SheetSummary[];
  sampleRows: PreviewSampleRow[];
}

export interface ExecuteCashflowImportResponse {
  batchId: string;
  totalRows: number;
  importedRows: number;
  skippedRows: number;
  failedRows: number;
  status: ImportBatchStatus;
}

export interface ImportBatchItem {
  id: string;
  importType: string;
  fileName: string;
  fileHash: string;
  activeYear: number;
  defaultAccountId: string;
  defaultBusinessUnitId: string | null;
  status: ImportBatchStatus;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  importedRows: number;
  skippedRows: number;
  failedRows: number;
  errorMessage: string | null;
  previewPayload: any;
  createdById: string;
  executedById: string | null;
  executedAt: string | null;
  createdAt: string;
  updatedAt: string;
  defaultAccount: Partial<Account>;
  defaultBusinessUnit: Partial<BusinessUnit> | null;
  createdBy: { id: string; name: string };
  executedBy: { id: string; name: string } | null;
}

export interface ImportBatchListResponse {
  data: ImportBatchItem[];
  meta: PaginationMeta;
}

export interface ImportBatchDetailResponse {
  data: ImportBatchItem;
}

export interface ImportRowItem {
  id: string;
  importBatchId: string;
  rowNumber: number;
  sheetName: string;
  month: number;
  day: number;
  transactionDate: string;
  rawDescription: string;
  rawIn: string | null;
  rawOut: string | null;
  rawSaldo: string | null;
  transactionType: "IN" | "OUT";
  amount: string;
  mappedCategoryId: string | null;
  mappedCategoryName: string | null;
  status: ImportRowStatus;
  errorMessage: string | null;
  warningMessage: string | null;
  transactionId: string | null;
  rawPayload: any;
  createdAt: string;
  updatedAt: string;
  mappedCategory: { id: string; name: string; type: string } | null;
  transaction: any | null;
}

export interface ImportRowListResponse {
  data: ImportRowItem[];
  meta: PaginationMeta;
}

export interface CancelImportBatchResponse {
  id: string;
  status: ImportBatchStatus;
}
