export type MonthlyOverviewQuery = {
  month: number;
  year: number;
  businessUnitId?: string;
  accountId?: string;
  includeNonCashEquivalent?: boolean;
  includeTransfersInAccountMovement?: boolean;
  includeOtherIncome?: boolean;
  includeOtherExpense?: boolean;
};

export type MonthlyOverviewResponse = {
  period: {
    month: number;
    year: number;
    dateFrom: string;
    dateTo: string;
  };
  profitability: {
    revenue: string;
    costOfGoodsSold: string;
    grossProfit: string;
    operatingExpense: string;
    otherIncome: string;
    otherExpense: string;
    netProfit: string;
    profitMargin: number | null;
  };
  cashPosition: {
    openingBalance: string;
    moneyIn: string;
    moneyOut: string;
    netCashflow: string;
    closingBalance: string;
  };
  warnings: {
    unmappedTransactionCount: number;
    unbalancedAccountCount: number;
  };
};

export type MonthlyProfitResponse = {
  revenue: string;
  costOfGoodsSold: string;
  grossProfit: string;
  operatingExpense: string;
  otherIncome: string;
  otherExpense: string;
  netProfit: string;
  profitMargin: number | null;
  unmapped: {
    transactionCount: number;
    totalIn: string;
    totalOut: string;
    categories: string[];
  };
};

export type MonthlyCashPositionResponse = {
  period: {
    month: number;
    year: number;
    dateFrom: string;
    dateTo: string;
  };
  summary: {
    openingBalance: string;
    moneyIn: string;
    moneyOut: string;
    netCashflow: string;
    closingBalance: string;
  };
  accounts: Array<{
    accountId: string;
    accountName: string;
    openingBalance: string;
    moneyIn: string;
    moneyOut: string;
    netMovement: string;
    closingBalance: string;
  }>;
};

export type ProfitVsCashflowResponse = {
  netProfit: string;
  adjustments: {
    financing: string;
    investing: string;
    equity: string;
    transfer: string;
    nonCash: string;
    unmapped: string;
    receivables: string;
    cashbon: string;
    debt: string;
    other: string;
  };
  netCashflow: string;
  unexplainedDifference: string;
  warning: null | {
    code: 'UNEXPLAINED_DIFFERENCE';
    message: string;
  };
};

export type AccountLedgerResponse = {
  accountId: string;
  accountName: string;
  openingBalance: string;
  rows: Array<{
    transactionDate: string | Date;
    transactionCode: string;
    type: 'IN' | 'OUT';
    amount: string;
    description: string | null;
    category: string;
    sourceModule: string;
    sourceId: string | null;
    status: 'POSTED' | 'VOID';
    runningBalance: string;
  }>;
  closingBalance: string;
};

export type BalanceReconciliationResponse = {
  accountId: string;
  accountName: string;
  initialBalance: string;
  storedCurrentBalance: string;
  calculatedBalance: string;
  difference: string;
  isBalanced: boolean;
};

export type AccountTransferResponse = {
  id: string;
  transferCode: string;
  transferDate: string | Date;
  amount: string;
  description: string | null;
  notes: string | null;
  status: 'POSTED' | 'VOID';
  voidReason: string | null;
  voidedAt: string | Date | null;
  sourceAccount: { id: string; name: string };
  destinationAccount: { id: string; name: string };
  outTransaction: { id: string; transactionCode: string; status: string };
  inTransaction: { id: string; transactionCode: string; status: string };
  createdBy: { id: string; name: string };
  voidedBy: { id: string; name: string } | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type CreateAccountTransferRequest = {
  transferDate: string;
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  description?: string;
  notes?: string;
};

export type VoidAccountTransferRequest = {
  voidReason: string;
};

export type FinancialPeriodResponse = {
  id: string;
  year: number;
  month: number;
  startDate: string | Date;
  endDate: string | Date;
  status: 'OPEN' | 'LOCKED' | 'CLOSED';
  lockedAt: string | Date | null;
  lockedById: string | null;
  closedAt: string | Date | null;
  closedById: string | null;
  reopenedAt: string | Date | null;
  reopenedById: string | null;
  notes: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type CreateFinancialPeriodRequest = {
  year: number;
  month: number;
  notes?: string;
};

export type LockFinancialPeriodRequest = {
  notes?: string;
};

export type CloseFinancialPeriodRequest = {
  notes?: string;
  force?: boolean;
};

export type ReopenFinancialPeriodRequest = {
  reason: string;
};
