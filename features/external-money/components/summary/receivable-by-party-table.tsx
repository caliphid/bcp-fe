import React from "react";
import { DataTable } from "../../../../components/ui/data-table";
import { ReceivableByPartyItem } from "@/types/receivable";
import { formatMoney, mapExternalPartyTypeLabel } from "../../utils/formatters";

interface ReceivableByPartyTableProps {
  data: ReceivableByPartyItem[];
  loading: boolean;
}

export function ReceivableByPartyTable({ data, loading }: ReceivableByPartyTableProps) {
  const columns = [
    {
      header: "Pihak Eksternal",
      cell: (item: ReceivableByPartyItem) => (
        <div>
          <div className="font-medium text-slate-900">{item.partyName} ({item.partyCode})</div>
          <div className="text-[11px] text-slate-500">{mapExternalPartyTypeLabel(item.partyType)}</div>
        </div>
      ),
    },
    {
      header: "Jumlah Data",
      cell: (item: ReceivableByPartyItem) => (
        <div className="text-sm">
          <div>{item.receivableCount} Total</div>
          {item.overdueCount > 0 && <div className="text-[11px] text-rose-500">{item.overdueCount} Overdue</div>}
        </div>
      ),
    },
    {
      header: "Saldo Pokok",
      cell: (item: ReceivableByPartyItem) => (
        <div className="text-right font-medium">{formatMoney(item.totalPrincipal)}</div>
      ),
    },
    {
      header: "Terkumpul",
      cell: (item: ReceivableByPartyItem) => (
        <div className="text-right text-emerald-600">{formatMoney(item.totalCollected)}</div>
      ),
    },
    {
      header: "Belum Dibayar",
      cell: (item: ReceivableByPartyItem) => (
        <div className="text-right font-bold text-amber-600">{formatMoney(item.totalOutstanding)}</div>
      ),
    },
  ];

  return (
    <DataTable
      title="Sisa Saldo Berdasarkan Pihak Eksternal"
      data={data}
      columns={columns}
      isLoading={loading}
    />
  );
}
