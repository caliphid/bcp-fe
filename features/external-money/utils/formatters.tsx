import React from "react";
import { ReceivableStatus, ReceivableType, ExternalPartyType, CollectionMethod } from "../../../types/receivable";

export function formatMoney(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatPercent(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0%";
  return `${num.toFixed(1)}%`;
}

export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function mapReceivableStatusBadge(status: ReceivableStatus | string | undefined) {
  if (!status) return <span className="text-slate-400">-</span>;
  
  const map: Record<string, { label: string; color: string }> = {
    ACTIVE: { label: "Aktif", color: "bg-blue-100 text-blue-800" },
    PARTIALLY_PAID: { label: "Dibayar Sebagian", color: "bg-amber-100 text-amber-800" },
    PAID_OFF: { label: "Lunas", color: "bg-emerald-100 text-emerald-800" },
    OVERDUE: { label: "Jatuh Tempo", color: "bg-rose-100 text-rose-800" },
    WRITTEN_OFF: { label: "Dihapuskan", color: "bg-slate-200 text-slate-800" },
    VOID: { label: "Batal", color: "bg-slate-100 text-slate-400 line-through" },
  };

  const config = map[status] || { label: status, color: "bg-slate-100 text-slate-800" };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}

export function mapReceivableTypeLabel(type: ReceivableType | string | undefined) {
  if (!type) return "-";
  const map: Record<string, string> = {
    CUSTOMER_RECEIVABLE: "Piutang Pelanggan",
    PERSONAL_LOAN: "Pinjaman Pribadi",
    PARTNER_LOAN: "Pinjaman Mitra",
    BUSINESS_ADVANCE: "Uang Muka Bisnis",
    TEMPORARY_EXTERNAL_FUND: "Dana Eksternal Sementara",
    DEPOSIT: "Deposit",
    EXTERNAL_INVESTMENT: "Investasi Eksternal",
    OTHER: "Lainnya",
  };
  return map[type] || type;
}

export function mapExternalPartyTypeLabel(type: ExternalPartyType | string | undefined) {
  if (!type) return "-";
  const map: Record<string, string> = {
    CUSTOMER: "Pelanggan",
    VENDOR: "Vendor",
    PARTNER: "Mitra",
    EMPLOYEE: "Karyawan",
    INDIVIDUAL: "Individu",
    COMPANY: "Perusahaan",
    OTHER: "Lainnya",
  };
  return map[type] || type;
}

export function mapCollectionMethodLabel(method: CollectionMethod | string | undefined) {
  if (!method) return "-";
  const map: Record<string, string> = {
    CASH: "Tunai",
    BANK_TRANSFER: "Transfer Bank",
    EWALLET: "E-Wallet",
    OFFSET: "Potong Tagihan (Offset)",
    OTHER: "Lainnya",
  };
  return map[method] || method;
}
