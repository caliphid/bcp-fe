import { InstallmentStatus, InstallmentPaymentStatus } from "../../../types/installment";

export { formatCurrency, formatDate, formatDateTime } from "../../debts/utils/formatters";

export const getInstallmentStatusColor = (status: InstallmentStatus) => {
  switch (status) {
    case "PENDING":
      return "bg-slate-100 text-slate-700";
    case "PARTIAL":
      return "bg-amber-100 text-amber-700";
    case "PAID":
      return "bg-emerald-100 text-emerald-700";
    case "OVERDUE":
      return "bg-rose-100 text-rose-700 font-bold";
    case "VOID":
      return "bg-slate-50 text-slate-400 line-through";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

export const getInstallmentStatusLabel = (status: InstallmentStatus) => {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "PARTIAL":
      return "Partial";
    case "PAID":
      return "Paid";
    case "OVERDUE":
      return "Overdue";
    case "VOID":
      return "Void";
    default:
      return status;
  }
};

export const getInstallmentPaymentStatusColor = (status: InstallmentPaymentStatus) => {
  switch (status) {
    case "POSTED":
      return "bg-emerald-100 text-emerald-700";
    case "VOID":
      return "bg-rose-100 text-rose-700 line-through";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

export const getInstallmentPaymentStatusLabel = (status: InstallmentPaymentStatus) => {
  switch (status) {
    case "POSTED":
      return "Posted";
    case "VOID":
      return "Void";
    default:
      return status;
  }
};
