export const formatCurrency = (val: string | number) => {
  const num = Number(val);
  return isNaN(num)
    ? "Rp 0"
    : new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(num);
};

export const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
};
