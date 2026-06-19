import { CashbonStatus, CashbonRepaymentMethod, CashbonRepaymentStatus } from "../../../types/crew-cashbon";

export function getCashbonStatusLabel(status: CashbonStatus): string {
  const map: Record<CashbonStatus, string> = {
    ACTIVE: "Aktif",
    PARTIALLY_PAID: "Sebagian Terbayar",
    PAID_OFF: "Lunas",
    OVERDUE: "Jatuh Tempo",
    VOID: "Dibatalkan",
    INACTIVE: "Nonaktif",
  };
  return map[status] || status;
}

export function getCashbonStatusColor(status: CashbonStatus): string {
  const map: Record<CashbonStatus, string> = {
    ACTIVE: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
    PARTIALLY_PAID: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20",
    PAID_OFF: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
    OVERDUE: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20",
    VOID: "bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-500/20",
    INACTIVE: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  };
  return map[status] || "bg-slate-100 text-slate-800";
}

export function getRepaymentMethodLabel(method: CashbonRepaymentMethod): string {
  const map: Record<CashbonRepaymentMethod, string> = {
    CASH: "Tunai",
    BANK_TRANSFER: "Transfer Bank",
    PAYROLL_DEDUCTION: "Potong Gaji",
    OTHER: "Lainnya",
  };
  return map[method] || method;
}

export function getRepaymentStatusLabel(status: CashbonRepaymentStatus): string {
  const map: Record<CashbonRepaymentStatus, string> = {
    POSTED: "Berhasil",
    VOID: "Dibatalkan",
  };
  return map[status] || status;
}

export function getRepaymentStatusColor(status: CashbonRepaymentStatus): string {
  const map: Record<CashbonRepaymentStatus, string> = {
    POSTED: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
    VOID: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20",
  };
  return map[status] || "bg-slate-100 text-slate-800";
}
