import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMoney(val: string | number) {
  const num = Number(val);
  return isNaN(num) ? "Rp 0" : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 2 }).format(num);
}

export function formatDate(dateStr: string | Date) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
