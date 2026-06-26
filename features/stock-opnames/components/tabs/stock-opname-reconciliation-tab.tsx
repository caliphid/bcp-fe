import { StockOpnameSession } from "../../../../types/stock-opname";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, FileMinus, FilePlus } from "lucide-react";

interface StockOpnameReconciliationTabProps {
  session: StockOpnameSession;
  reconciliationReport?: any;
}

export function StockOpnameReconciliationTab({ session, reconciliationReport }: StockOpnameReconciliationTabProps) {
  const items = Array.isArray(reconciliationReport) ? reconciliationReport : (reconciliationReport?.items || []);

  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-1">No Reconciliation Data</h3>
      </div>
    );
  }

  const getReconciliationStatus = (varianceQty: number) => {
    if (varianceQty === 0) return { label: "Matched", color: "text-slate-600 bg-slate-100", icon: <CheckCircle2 className="w-3 h-3" /> };
    if (varianceQty > 0) return { label: "Surplus", color: "text-emerald-700 bg-emerald-100", icon: <FilePlus className="w-3 h-3" /> };
    return { label: "Shortage", color: "text-rose-700 bg-rose-100", icon: <FileMinus className="w-3 h-3" /> };
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="font-semibold text-slate-600">Product / SKU</TableHead>
            <TableHead className="font-semibold text-slate-600 text-right">System Qty</TableHead>
            <TableHead className="font-semibold text-slate-600 text-right">Count Qty</TableHead>
            <TableHead className="font-semibold text-slate-600 text-right">Variance Qty</TableHead>
            <TableHead className="font-semibold text-slate-600">Reconciliation Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item: any) => {
            const productName = item.product?.name || item.productVariant?.product?.name || "Unknown Product";
            const sku = item.sku || item.productVariant?.sku || item.product?.sku || "-";
            const recStatus = getReconciliationStatus(item.varianceQuantity || 0);

            return (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800">{productName}</span>
                    <span className="text-xs text-slate-500">SKU: {sku}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium text-slate-700">
                  {item.snapshotOnHand}
                </TableCell>
                <TableCell className="text-right font-bold text-slate-800">
                  {item.finalCountQuantity ?? "-"}
                </TableCell>
                <TableCell className="text-right">
                  <span className={`font-bold ${item.varianceQuantity < 0 ? 'text-rose-600' : item.varianceQuantity > 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
                    {item.varianceQuantity > 0 ? '+' : ''}{item.varianceQuantity || 0}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${recStatus.color}`}>
                    {recStatus.icon} {recStatus.label}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
