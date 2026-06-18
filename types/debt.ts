import { Account } from "./account";
import { BusinessUnit } from "./business-unit";
import { Transaction } from "./transaction";
import { User } from "./auth";

export type DebtType = 
  | "BANK_LOAN" 
  | "PERSONAL_LOAN" 
  | "BUSINESS_CAPITAL" 
  | "ASSET_PURCHASE" 
  | "CREDIT_CARD" 
  | "PAYABLE" 
  | "OTHER";

export type DebtStatus = "ACTIVE" | "PAID_OFF" | "INACTIVE" | "DEFAULTED";
export type DebtPaymentStatus = "POSTED" | "VOID";

export interface DebtItem {
  id: string;
  debtCode: string;
  businessUnit: BusinessUnit | null;
  debtName: string;
  lenderName: string;
  type: DebtType;
  principalAmount: string;
  currentBalance: string;
  paidAmount: string;
  progressPercentage: number;
  startDate: string;
  dueDate: string | null;
  monthlyInstallment: string | null;
  interestRate?: string | null;
  notes?: string | null;
  status: DebtStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DebtPaymentItem {
  id: string;
  paymentCode: string;
  debt?: {
    id: string;
    debtName: string;
  };
  account: Account;
  transaction: Transaction | null;
  paymentDate: string;
  amount: string;
  description: string | null;
  notes: string | null;
  attachmentUrl: string | null;
  status: DebtPaymentStatus;
  voidReason: string | null;
  voidedAt: string | null;
  voidedBy: User | null;
  createdBy: User | null;
  updatedBy: User | null;
  createdAt: string;
  updatedAt: string;
}

export interface DebtDetail extends Omit<DebtItem, "paidAmount" | "interestRate" | "notes"> {
  totalPaid: string;
  paymentCount: number;
  interestRate: string | null;
  notes: string | null;
  closedAt: string | null;
  createdBy: User | null;
  updatedBy: User | null;
  closedBy: User | null;
  payments: DebtPaymentItem[];
}

export interface DebtSummaryData {
  totalPrincipal: string;
  totalCurrentBalance: string;
  totalPaid: string;
  activeDebtCount: number;
  paidOffDebtCount: number;
  inactiveDebtCount: number;
  defaultedDebtCount: number;
  averageProgressPercentage: number;
}

export interface DebtByLenderItem {
  lenderName: string;
  debtCount: number;
  totalPrincipal: string;
  totalCurrentBalance: string;
  totalPaid: string;
}

export interface DebtByBusinessUnitItem {
  businessUnitId: string | null;
  businessUnitName: string;
  debtCount: number;
  totalPrincipal: string;
  totalCurrentBalance: string;
  totalPaid: string;
}

// Payloads
export interface CreateDebtPayload {
  businessUnitId?: string | null;
  debtName: string;
  lenderName: string;
  type: DebtType;
  principalAmount: number;
  startDate: string;
  dueDate?: string | null;
  interestRate?: number | null;
  monthlyInstallment?: number | null;
  notes?: string | null;
}

export interface UpdateDebtPayload extends CreateDebtPayload {}

export interface CreateDebtPaymentPayload {
  paymentDate: string;
  accountId: string;
  amount: number;
  categoryId?: string | null;
  description?: string | null;
  notes?: string | null;
  attachmentUrl?: string | null;
}

export interface VoidDebtPaymentPayload {
  voidReason: string;
}
