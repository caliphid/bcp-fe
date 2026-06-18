import { DebtStatus, DebtType, DebtPaymentStatus } from "../../../types/debt";

export const formatCurrency = (amount: number | string | null | undefined): string => {
  if (amount === null || amount === undefined) return "-";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "-";
  
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";
  
  return new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

export const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";
  
  return new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const getDebtStatusColor = (status: DebtStatus) => {
  switch (status) {
    case "ACTIVE":
      return "bg-indigo-100 text-indigo-700";
    case "PAID_OFF":
      return "bg-emerald-100 text-emerald-700";
    case "INACTIVE":
      return "bg-slate-100 text-slate-700";
    case "DEFAULTED":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

export const getDebtStatusLabel = (status: DebtStatus) => {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "PAID_OFF":
      return "Paid Off";
    case "INACTIVE":
      return "Inactive";
    case "DEFAULTED":
      return "Defaulted";
    default:
      return status;
  }
};

export const getDebtTypeLabel = (type: DebtType) => {
  switch (type) {
    case "BANK_LOAN": return "Bank Loan";
    case "PERSONAL_LOAN": return "Personal Loan";
    case "BUSINESS_CAPITAL": return "Business Capital";
    case "ASSET_PURCHASE": return "Asset Purchase";
    case "CREDIT_CARD": return "Credit Card";
    case "PAYABLE": return "Payable";
    case "OTHER": return "Other";
    default: return type;
  }
};

export const getPaymentStatusColor = (status: DebtPaymentStatus) => {
  switch (status) {
    case "POSTED":
      return "bg-emerald-100 text-emerald-700";
    case "VOID":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

export const getPaymentStatusLabel = (status: DebtPaymentStatus) => {
  switch (status) {
    case "POSTED":
      return "Posted";
    case "VOID":
      return "Void";
    default:
      return status;
  }
};
