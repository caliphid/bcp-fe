export type ExternalPartyType =
  | "CUSTOMER"
  | "VENDOR"
  | "PARTNER"
  | "EMPLOYEE"
  | "INDIVIDUAL"
  | "COMPANY"
  | "OTHER";

export type ExternalPartyStatus = "ACTIVE" | "INACTIVE";

export type ReceivableType =
  | "CUSTOMER_RECEIVABLE"
  | "PERSONAL_LOAN"
  | "PARTNER_LOAN"
  | "BUSINESS_ADVANCE"
  | "TEMPORARY_EXTERNAL_FUND"
  | "DEPOSIT"
  | "EXTERNAL_INVESTMENT"
  | "OTHER";

export type ReceivableStatus =
  | "ACTIVE"
  | "PARTIALLY_PAID"
  | "PAID_OFF"
  | "OVERDUE"
  | "WRITTEN_OFF"
  | "VOID";

export type CollectionMethod = "CASH" | "BANK_TRANSFER" | "EWALLET" | "OFFSET" | "OTHER";

export type AgingBucket = "NOT_DUE" | "1_TO_30_DAYS" | "31_TO_60_DAYS" | "61_TO_90_DAYS" | "OVER_90_DAYS";

export interface ExternalParty {
  id: string;
  partyCode: string;
  name: string;
  type: ExternalPartyType;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  identificationNumber?: string | null;
  companyName?: string | null;
  notes?: string | null;
  status: ExternalPartyStatus;
  createdById: string;
  updatedById?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExternalPartyPayload {
  name: string;
  type: ExternalPartyType;
  phone?: string;
  email?: string;
  address?: string;
  identificationNumber?: string;
  companyName?: string;
  notes?: string;
}

export interface ReceivableItem {
  id: string;
  receivableCode: string;
  externalParty: {
    id: string;
    partyCode: string;
    name: string;
    type: ExternalPartyType;
  };
  businessUnit?: {
    id: string;
    name: string;
  } | null;
  receivableType: ReceivableType;
  receivableDate: string;
  dueDate?: string | null;
  principalAmount: string;
  amountCollected: string;
  writtenOffAmount: string;
  remainingBalance: string;
  progressPercentage: number;
  status: ReceivableStatus;
  createdAt: string;
  updatedAt: string;
  computedStatus?: "OVERDUE" | string;
}

export interface CreateReceivablePayload {
  externalPartyId: string;
  businessUnitId?: string;
  receivableType: ReceivableType;
  receivableDate: string;
  dueDate?: string;
  principalAmount: number;
  title: string;
  description?: string;
  notes?: string;
  attachmentUrl?: string;
  createCashflowDisbursement: boolean;
  disbursementAccountId?: string;
  categoryId?: string;
}

export interface UpdateReceivablePayload {
  dueDate?: string;
  title?: string;
  description?: string;
  notes?: string;
  attachmentUrl?: string;
}

export interface ReceivableDetail {
  id: string;
  receivableCode: string;
  externalParty: {
    id: string;
    partyCode: string;
    name: string;
    type: ExternalPartyType;
  };
  businessUnit?: {
    id: string;
    name: string;
  } | null;
  disbursementAccount?: {
    id: string;
    name: string;
  } | null;
  disbursementTransaction?: {
    id: string;
    transactionCode: string;
    type: string;
    amount: string;
    status: string;
  } | null;
  receivableType: ReceivableType;
  receivableDate: string;
  dueDate?: string | null;
  principalAmount: string;
  amountCollected: string;
  writtenOffAmount: string;
  remainingBalance: string;
  progressPercentage: number;
  title: string;
  description?: string | null;
  notes?: string | null;
  attachmentUrl?: string | null;
  createCashflowDisbursement: boolean;
  status: ReceivableStatus;
  closedAt?: string | null;
  voidReason?: string | null;
  collections: any[];
  writeOffs: any[];
}

export interface CreateCollectionPayload {
  collectionDate: string;
  accountId?: string;
  amount: number;
  method: CollectionMethod;
  categoryId?: string;
  description?: string;
  notes?: string;
  attachmentUrl?: string;
}

export interface ReceivableCollection {
  id: string;
  collectionCode: string;
  collectionDate: string;
  account?: {
    id: string;
    name: string;
  } | null;
  amount: string;
  method: CollectionMethod;
  transaction?: {
    id: string;
    transactionCode: string;
    type: string;
    status: string;
  } | null;
  description?: string | null;
  notes?: string | null;
  attachmentUrl?: string | null;
  status: string;
  voidReason?: string | null;
  createdAt: string;
}

export interface ReceivableCollectionDetail extends ReceivableCollection {
  createdBy?: { id: string; name: string } | null;
  updatedBy?: { id: string; name: string } | null;
  voidedBy?: { id: string; name: string } | null;
}

export interface CreateWriteOffPayload {
  writeOffDate: string;
  amount: number;
  reason: string;
  notes?: string;
}

export interface ReceivableWriteOff {
  id: string;
  writeOffCode: string;
  writeOffDate: string;
  amount: string;
  reason: string;
  notes?: string | null;
  status: string;
  voidReason?: string | null;
  createdAt: string;
}

export interface VoidPayload {
  voidReason: string;
}

export interface ReceivableSummaryData {
  totalReceivableCount: number;
  activeCount: number;
  partialCount: number;
  paidOffCount: number;
  overdueCount: number;
  writtenOffCount: number;
  totalPrincipal: string;
  totalCollected: string;
  totalWrittenOff: string;
  totalOutstanding: string;
  collectionProgressPercentage: number;
}

export interface ReceivableByPartyItem {
  externalPartyId: string;
  partyCode: string;
  partyName: string;
  partyType: ExternalPartyType;
  receivableCount: number;
  totalPrincipal: string;
  totalCollected: string;
  totalWrittenOff: string;
  totalOutstanding: string;
  overdueCount: number;
}

export interface ReceivableByTypeItem {
  receivableType: ReceivableType;
  receivableCount: number;
  totalPrincipal: string;
  totalCollected: string;
  totalWrittenOff: string;
  totalOutstanding: string;
}

export interface ReceivableAgingBucket {
  bucket: AgingBucket;
  receivableCount: number;
  totalOutstanding: string;
}
