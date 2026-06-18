export interface DashboardPeriod {
  dateFrom: string;
  dateTo: string;
  year: number;
  month: number;
}

export interface DashboardOverviewSummary {
  totalIn: string;
  totalOut: string;
  netCashflow: string;
  transactionCount: number;
  inCount: number;
  outCount: number;
}

export interface DashboardAccountBalanceSummary {
  totalCurrentBalance: string;
  activeAccountsCount: number;
}

export interface DashboardTopCategory {
  categoryId: string;
  categoryName: string;
  totalAmount: string;
}

export interface FinanceHealthWarning {
  type: string;
  message: string;
}

export interface DashboardFinanceHealth {
  status: "HEALTHY" | "WARNING" | "DANGER" | "NEUTRAL";
  netCashflowStatus: "POSITIVE" | "NEGATIVE";
  expenseRatio: number;
  incomeToExpenseRatio: number;
  message: string;
  warnings: FinanceHealthWarning[];
}

export interface RecentDashboardTransactionItem {
  id: string;
  transactionCode: string;
  transactionDate: string;
  type: "IN" | "OUT";
  amount: string;
  description: string | null;
  businessUnit: { id: string; name: string } | null;
  account: { id: string; name: string; type: string };
  category: { id: string; name: string; type: string };
  status: string;
}

export interface DashboardOverviewData {
  period: DashboardPeriod;
  currency: string;
  summary: DashboardOverviewSummary;
  recentTransactions: RecentDashboardTransactionItem[];
  accountBalance?: DashboardAccountBalanceSummary;
  topExpenseCategory?: DashboardTopCategory;
  topIncomeCategory?: DashboardTopCategory;
  health?: DashboardFinanceHealth;
}

export interface DashboardOverviewResponse {
  message: string;
  data: DashboardOverviewData;
}

export interface CashflowSummaryData extends DashboardOverviewSummary {
  averageIn: string;
  averageOut: string;
}

export interface CashflowSummaryResponse {
  message: string;
  data: CashflowSummaryData;
}

export interface MonthlyTrendItem {
  month: number;
  monthName: string;
  totalIn: string;
  totalOut: string;
  netCashflow: string;
  transactionCount: number;
}

export interface MonthlyTrendResponse {
  message: string;
  data: MonthlyTrendItem[];
}

export interface DailyTrendItem {
  date: string;
  totalIn: string;
  totalOut: string;
  netCashflow: string;
  transactionCount: number;
}

export interface DailyTrendResponse {
  message: string;
  data: DailyTrendItem[];
}

export interface CategoryBreakdownItem {
  categoryId: string;
  categoryName: string;
  categoryType: "IN" | "OUT";
  totalAmount: string;
  transactionCount: number;
  percentage: number;
}

export interface CategoryBreakdownResponse {
  message: string;
  data: CategoryBreakdownItem[];
}

export interface TopTransactionItem {
  id: string;
  transactionCode: string;
  transactionDate: string;
  categoryName: string;
  accountName: string;
  businessUnitName: string | null;
  amount: string;
  description: string | null;
}

export interface TopExpensesResponse {
  message: string;
  data: TopTransactionItem[];
}

export interface TopIncomeSourcesResponse {
  message: string;
  data: TopTransactionItem[];
}

export interface AccountBalanceItem {
  accountId: string;
  accountName: string;
  accountType: string;
  businessUnit: { id: string; name: string } | null;
  initialBalance: string;
  currentBalance: string;
  status: string;
}

export interface AccountBalanceOverviewResponse {
  message: string;
  data: {
    totalCurrentBalance: string;
    accounts: AccountBalanceItem[];
  };
}

export interface BusinessUnitPerformanceItem {
  businessUnitId: string | null;
  businessUnitName: string | null;
  totalIn: string;
  totalOut: string;
  netCashflow: string;
  transactionCount: number;
}

export interface BusinessUnitPerformanceResponse {
  message: string;
  data: BusinessUnitPerformanceItem[];
}

export interface MonthComparisonData {
  current: {
    month: number;
    year: number;
    totalIn: string;
    totalOut: string;
    netCashflow: string;
  };
  previous: {
    month: number;
    year: number;
    totalIn: string;
    totalOut: string;
    netCashflow: string;
  };
  growth: {
    totalInGrowthPercentage: number | null;
    totalOutGrowthPercentage: number | null;
    netCashflowGrowthPercentage: number | null;
  };
}

export interface MonthComparisonResponse {
  message: string;
  data: MonthComparisonData;
}

export interface YearlySummaryData {
  year: number;
  totalIn: string;
  totalOut: string;
  netCashflow: string;
  bestMonth: {
    month: number;
    monthName: string;
    netCashflow: string;
  };
  worstMonth: {
    month: number;
    monthName: string;
    netCashflow: string;
  };
  averageMonthlyIn: string;
  averageMonthlyOut: string;
  averageMonthlyNet: string;
}

export interface YearlySummaryResponse {
  message: string;
  data: YearlySummaryData;
}

export interface RecentTransactionsResponse {
  message: string;
  data: RecentDashboardTransactionItem[];
}

export interface FinanceHealthResponse {
  message: string;
  data: DashboardFinanceHealth;
}
