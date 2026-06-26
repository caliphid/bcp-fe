import { StockOpnameSession, StockOpnameCountMode } from "../../../../types/stock-opname";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, FileMinus } from "lucide-react";

interface StockOpnameVarianceTabProps {
  session: StockOpnameSession;
  varianceReport?: any;
}

export function StockOpnameVarianceTab({ session, varianceReport }: StockOpnameVarianceTabProps) {
  const items = Array.isArray(varianceReport) ? varianceReport : (varianceReport?.items || []);

  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileMinus className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">No Variances Found</h3>
        <p className="text-slate-500 text-sm">All physical counts match the system quantity.</p>
      </div>
    );
  }

  const isBlindCount = session.countMode === StockOpnameCountMode.BLIND;

  return (
    <div className="space-y-4">
      <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-start gap-3 shadow-sm">
        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
        <div>
          <h4 className="font-bold text-sm">Variances Detected</h4>
          <p className="text-xs mt-1">
            There are {items.length} items with quantities differing from the system record.
            Approval requires notes explaining these discrepancies.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold text-slate-600">Product / SKU</TableHead>
              {!isBlindCount && <TableHead className="font-semibold text-slate-600 text-right">System Qty</TableHead>}
              <TableHead className="font-semibold text-slate-600 text-right">Physical Count</TableHead>
              <TableHead className="font-semibold text-slate-600 text-right">Damaged Qty</TableHead>
              <TableHead className="font-semibold text-slate-600 text-right">Variance Qty</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item: any) => {
              const productName = item.product?.name || item.productVariant?.product?.name || "Unknown Product";
              const sku = item.sku || item.productVariant?.sku || item.product?.sku || "-";
              
              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">{productName}</span>
                      <span className="text-xs text-slate-500">SKU: {sku}</span>
                    </div>
                  </TableCell>
                  {!isBlindCount && (
                    <TableCell className="text-right font-medium text-slate-700">
                      {item.snapshotOnHand}
                    </TableCell>
                  )}
                  <TableCell className="text-right font-bold text-slate-800">
                    {item.finalCountQuantity ?? "-"}
                  </TableCell>
                  <TableCell className="text-right font-medium text-slate-700">
                    {item.finalDamagedQuantity ?? 0}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-bold ${item.varianceQuantity < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {item.varianceQuantity > 0 ? '+' : ''}{item.varianceQuantity}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
