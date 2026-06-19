import { BusinessUnit } from "./business-unit";
import { Account } from "./account";
import { Transaction } from "./transaction";
import { User } from "./auth";
import { Crew } from "./crew";
import { Category } from "./category";

export type CashbonStatus = 
  | "ACTIVE" 
  | "PARTIALLY_PAID" 
  | "PAID_OFF" 
  | "OVERDUE" 
  | "VOID" 
  | "INACTIVE";

export type CashbonRepaymentMethod = 
  | "CASH" 
  | "BANK_TRANSFER" 
  | "PAYROLL_DEDUCTION" 
  | "OTHER";

export type CashbonRepaymentStatus = "POSTED" | "VOID";

export interface CrewCashbonItem {
  id: string;
  cashbonCode: string;
  crew: Crew;
  businessUnit: BusinessUnit | null;
  cashbonDate: string;
  dueDate: string | null;
  principalAmount: string;
  amountPaid: string;
  remainingBalance: string;
  progressPercentage: number;
  status: CashbonStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CashbonRepaymentItem {
  id: string;
  repaymentCode: string;
  cashbonId: string;
  account: Account | null;
  transaction: Transaction | null;
  repaymentDate: string;
  amount: string;
  method: CashbonRepaymentMethod;
  description: string | null;
  notes: string | null;
  attachmentUrl: string | null;
  status: CashbonRepaymentStatus;
  voidReason: string | null;
  voidedAt: string | null;
  voidedBy: User | null;
  createdBy: User | null;
  updatedBy: User | null;
  createdAt: string;
  updatedAt: string;
}

export interface CrewCashbonDetail extends CrewCashbonItem {
  disbursementAccount: Account;
  disbursementTransaction: Transaction | null;
  category: Category | null;
  purpose: string | null;
  notes: string | null;
  attachmentUrl: string | null;
  voidReason: string | null;
  voidedAt: string | null;
  closedAt: string | null;
  createdBy: User | null;
  updatedBy: User | null;
  voidedBy: User | null;
  closedBy: User | null;
  repayments: CashbonRepaymentItem[];
}

export interface CashbonSummaryData {
  totalCashbonCount: number;
  activeCount: number;
  partialCount: number;
  paidOffCount: number;
  overdueCount: number;
  totalPrincipal: string;
  totalPaid: string;
  totalOutstanding: string;
  averageCashbonAmount: string;
  repaymentProgressPercentage: number;
}

export interface CashbonByCrewItem {
  crewId: string;
  crewName: string;
  position: string | null;
  cashbonCount: number;
  totalPrincipal: string;
  totalPaid: string;
  totalOutstanding: string;
  overdueCount: number;
}

// Payloads
export interface CreateCrewCashbonPayload {
  crewId: string;
  businessUnitId?: string | null;
  disbursementAccountId: string;
  cashbonDate: string;
  dueDate?: string | null;
  principalAmount: number;
  categoryId?: string | null;
  purpose?: string | null;
  notes?: string | null;
  attachmentUrl?: string | null;
}

export interface UpdateCrewCashbonPayload {
  crewId?: string;
  businessUnitId?: string | null;
  cashbonDate?: string;
  dueDate?: string | null;
  purpose?: string | null;
  notes?: string | null;
  attachmentUrl?: string | null;
}

export interface CreateCashbonRepaymentPayload {
  repaymentDate: string;
  accountId?: string | null;
  amount: number;
  method: CashbonRepaymentMethod;
  categoryId?: string | null;
  description?: string | null;
  notes?: string | null;
  attachmentUrl?: string | null;
}

export interface VoidCashbonPayload {
  voidReason: string;
}

export interface VoidCashbonRepaymentPayload {
  voidReason: string;
}
