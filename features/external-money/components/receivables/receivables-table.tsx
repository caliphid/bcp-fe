import React from "react";
import { DataTable } from "../../../../components/ui/data-table";
import { ReceivableItem } from "@/types/receivable";
import { formatMoney, formatDate, mapReceivableStatusBadge, mapReceivableTypeLabel } from "../../utils/formatters";
import { Button } from "../../../../components/ui/button";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";

interface ReceivablesTableProps {
  data: ReceivableItem[];
  meta?: any;
  loading: boolean;
  onPageChange: (page: number) => void;
  headerActions?: React.ReactNode;
}

export function ReceivablesTable({
  data,
  meta,
  loading,
  onPageChange,
  headerActions,
}: ReceivablesTableProps) {
  const router = useRouter();

  const columns = [
    {
      header: "Kode",
      cell: (item: ReceivableItem) => (
        <div>
          <div className="font-medium text-slate-900">{item.receivableCode}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{mapReceivableTypeLabel(item.receivableType)}</div>
        </div>
      ),
    },
    {
      header: "Pihak & Unit",
      cell: (item: ReceivableItem) => (
        <div>
          <div className="font-medium">{item.externalParty.name}</div>
          <div className="text-[11px] text-slate-500">{item.businessUnit?.name || "-"}</div>
        </div>
      ),
    },
    {
      header: "Tanggal",
      cell: (item: ReceivableItem) => (
        <div className="text-sm">
          <div><span className="text-slate-400">Tgl:</span> {formatDate(item.receivableDate)}</div>
          <div><span className="text-slate-400">Jatuh Tempo:</span> {formatDate(item.dueDate)}</div>
        </div>
      ),
    },
    {
      header: "Jumlah",
      cell: (item: ReceivableItem) => (
        <div className="text-right">
          <div className="font-semibold text-slate-700">{formatMoney(item.principalAmount)}</div>
          <div className="text-[11px] text-emerald-600">Paid: {formatMoney(item.amountCollected)}</div>
          {parseFloat(item.writtenOffAmount) > 0 && (
            <div className="text-[11px] text-rose-500">WO: {formatMoney(item.writtenOffAmount)}</div>
          )}
        </div>
      ),
    },
    {
      header: "Sisa Saldo",
      cell: (item: ReceivableItem) => (
        <div className="text-right font-bold text-rose-600">
          {formatMoney(item.remainingBalance)}
        </div>
      ),
    },
    {
      header: "Status",
      cell: (item: ReceivableItem) => (
        <div className="flex flex-col items-start gap-1.5">
          {mapReceivableStatusBadge(item.computedStatus || item.status)}
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
            <div 
              className="bg-emerald-500 h-1.5 rounded-full" 
              style={{ width: `${Math.min(100, item.progressPercentage)}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      header: "Aksi",
      cell: (item: ReceivableItem) => (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push(`/dashboard/receivables/${item.id}`)}
        >
          <Eye className="h-4 w-4 mr-2" /> Detail
        </Button>
      ),
    },
  ];

  return (
    <DataTable
      title="Daftar Piutang"
      description="Daftar semua piutang pelanggan, pinjaman, dan uang eksternal lainnya."
      data={data}
      columns={columns}
      meta={meta}
      onPageChange={onPageChange}
      isLoading={loading}
      headerActions={headerActions}
    />
  );
}
