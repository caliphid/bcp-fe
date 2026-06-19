import { Account } from "./account";
import { User } from "./auth";

export type InstallmentStatus = "PENDING" | "PARTIAL" | "PAID" | "OVERDUE" | "VOID";
export type InstallmentPaymentStatus = "POSTED" | "VOID";
export type InstallmentFrequency = "MONTHLY";

export interface DebtInstallmentItem {
  id: string;
  installmentCode: string;
  debt: {
    id: string;
    debtCode: string;
    debtName: string;
    lenderName?: string;
    businessUnit?: {
      id: string;
      name: string;
    } | null;
  } | null;
  installmentNumber: number;
  dueDate: string;
  amountDue: string;
  amountPaid: string;
  remainingAmount: string;
  paidAt: string | null;
  status: InstallmentStatus;
  notes: string | null;
  voidReason: string | null;
  voidedAt: string | null;
  voidedBy: User | null;
  paymentCount: number;
  createdBy: User | null;
  updatedBy: User | null;
  createdAt: string;
  updatedAt: string;
}

export interface DebtInstallmentPaymentItem {
  id: string;
  paymentCode: string;
  installment: {
    id: string;
    installmentCode: string;
    installmentNumber: number;
    dueDate: string;
  };
  debt: {
    id: string;
    debtCode: string;
    debtName: string;
  };
  debtPayment: {
    id: string;
    paymentCode: string;
    status: InstallmentPaymentStatus;
  } | null;
  transaction: {
    id: string;
    transactionCode: string;
    status: string;
  } | null;
  account: Account;
  paymentDate: string;
  amount: string;
  description: string | null;
  notes: string | null;
  attachmentUrl: string | null;
  status: InstallmentPaymentStatus;
  voidReason: string | null;
  voidedAt: string | null;
  voidedBy: User | null;
  createdBy: User | null;
  updatedBy: User | null;
  createdAt: string;
  updatedAt: string;
}

export interface DebtInstallmentDetail extends DebtInstallmentItem {
  payments: DebtInstallmentPaymentItem[];
}

export interface DebtInstallmentSummaryData {
  totalInstallments: number;
  pendingCount: number;
  partialCount: number;
  paidCount: number;
  overdueCount: number;
  voidCount: number;
  totalAmountDue: string;
  totalAmountPaid: string;
  totalRemainingAmount: string;
}

export type UpcomingDebtInstallmentItem = DebtInstallmentItem;

// Payloads
export interface GenerateDebtInstallmentSchedulePayload {
  startDate: string;
  installmentAmount: number;
  numberOfInstallments: number;
  frequency: InstallmentFrequency;
  dueDayOfMonth?: number | null;
  adjustFinalInstallment?: boolean;
  notes?: string | null;
}

export interface GenerateDebtInstallmentScheduleResponse {
  debtId: string;
  generatedCount: number;
  totalScheduledAmount: string;
  installments: Array<{
    id: string;
    installmentNumber: number;
    dueDate: string;
    amountDue: string;
    remainingAmount: string;
    status: InstallmentStatus;
  }>;
}

export interface CreateDebtInstallmentPayload {
  installmentNumber: number;
  dueDate: string;
  amountDue: number;
  notes?: string | null;
}

export interface UpdateDebtInstallmentPayload {
  dueDate?: string;
  amountDue?: number;
  notes?: string | null;
}

export interface PayDebtInstallmentPayload {
  paymentDate: string;
  accountId: string;
  amount: number;
  categoryId?: string | null;
  description?: string | null;
  notes?: string | null;
  attachmentUrl?: string | null;
}

export interface VoidDebtInstallmentPayload {
  voidReason: string;
}

export interface VoidInstallmentPaymentPayload {
  voidReason: string;
}
