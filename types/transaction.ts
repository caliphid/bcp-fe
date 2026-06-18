import { TransactionStatus, TransactionType } from './enums';
import { BusinessUnit } from './business-unit';
import { Account } from './account';
import { Category } from './category';
import { User } from './auth';

export interface Transaction {
  id: string;
  transactionCode: string;
  transactionDate: string;
  type: TransactionType;
  amount: string;
  description: string | null;
  notes: string | null;
  attachmentUrl: string | null;
  status: TransactionStatus;
  voidReason: string | null;
  voidedAt: string | null;
  createdAt: string;
  updatedAt: string;

  // Relations
  businessUnit: { id: string; name: string } | null;
  account: { id: string; name: string; type: string } | null;
  category: { id: string; name: string; type: string } | null;
  createdBy: { id: string; name: string } | null;
  updatedBy: { id: string; name: string } | null;
  voidedBy: { id: string; name: string } | null;
}

export interface TransactionSummary {
  totalIn: string;
  totalOut: string;
  netCashflow: string;
  transactionCount: number;
  inCount: number;
  outCount: number;
}

export interface MonthlySummary {
  monthName: string;
  month: number;
  year: number;
  totalIn: string;
  totalOut: string;
  netCashflow: string;
}

export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  categoryType: string;
  totalAmount: string;
  transactionCount: number;
}

export interface AccountSummary {
  accountId: string;
  accountName: string;
  accountType: string;
  businessUnit: { id: string; name: string } | null;
  initialBalance: string;
  currentBalance: string;
  status: string;
}

export interface CreateTransactionPayload {
  transactionDate: string;
  businessUnitId?: string;
  accountId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  description?: string;
  notes?: string;
  attachmentUrl?: string;
}

export interface UpdateTransactionPayload {
  transactionDate?: string;
  businessUnitId?: string;
  accountId?: string;
  categoryId?: string;
  type?: TransactionType;
  amount?: number;
  description?: string;
  notes?: string;
  attachmentUrl?: string;
}

export interface VoidTransactionPayload {
  voidReason: string;
}
