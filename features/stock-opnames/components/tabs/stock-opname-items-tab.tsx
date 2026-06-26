import { useState, useEffect } from "react";
import { StockOpnameSession, StockOpnameItem, StockOpnameSessionStatus, StockOpnameCountMode, StockOpnameItemStatus } from "../../../../types/stock-opname";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, AlertCircle, Save } from "lucide-react";
import { stockOpnameApi } from "../../api";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/auth-store";

interface StockOpnameItemsTabProps {
  session: StockOpnameSession;
  onRefresh: () => void;
}

export function StockOpnameItemsTab({ session, onRefresh }: StockOpnameItemsTabProps) {
  const { user } = useAuthStore();
  const [counts, setCounts] = useState<Record<string, { countedQuantity: number | string; damagedQuantity: number | string; notes: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Reset inputs when session changes
  useEffect(() => {
    const initialCounts: any = {};
    session.items?.forEach(item => {
      initialCounts[item.id] = {
        countedQuantity: item.finalCountQuantity ?? '',
        damagedQuantity: item.finalDamagedQuantity ?? 0,
        notes: ''
      };
    });
    setCounts(initialCounts);
  }, [session.items]);

  const handleCountChange = (id: string, field: string, value: string) => {
    const numValue = value === '' ? '' : Number(value);
    setCounts(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: numValue
      }
    }));
  };

  const handleNoteChange = (id: string, value: string) => {
    setCounts(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        notes: value
      }
    }));
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedItems);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedItems(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === session.items?.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(session.items?.map(i => i.id) || []));
    }
  };

  const submitSelected = async () => {
    if (selectedItems.size === 0) {
      toast.error("Please select at least one item to submit");
      return;
    }

    const itemsToSubmit = Array.from(selectedItems).map(id => {
      const c = counts[id];
      if (c.countedQuantity === '') {
        return null;
      }
      return {
        snapshotItemId: id,
        countedQuantity: Number(c.countedQuantity),
        damagedQuantity: Number(c.damagedQuantity) || 0,
        notes: c.notes || undefined
      };
    }).filter(Boolean) as any[];

    if (itemsToSubmit.length === 0) {
      toast.error("Please enter quantities for selected items");
      return;
    }

    setIsSubmitting(true);
    try {
      await stockOpnameApi.submitCounts(session.id, { items: itemsToSubmit });
      toast.success("Counts submitted successfully");
      setSelectedItems(new Set());
      onRefresh();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to submit counts");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBlindCount = session.countMode === StockOpnameCountMode.BLIND && user?.role === "STAFF_INPUT" && 
    (session.status !== StockOpnameSessionStatus.POSTED && session.status !== StockOpnameSessionStatus.VOIDED);
    
  const canSubmit = session.status === StockOpnameSessionStatus.COUNTING && !session.isSnapshotStale;
  
  return (
    <div className="space-y-4">
      {canSubmit && (
        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
          <span className="text-sm font-semibold text-slate-700">
            {selectedItems.size} items selected
          </span>
          <Button 
            onClick={submitSelected} 
            disabled={selectedItems.size === 0 || isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Submit Selected Counts
          </Button>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              {canSubmit && (
                <TableHead className="w-[50px] text-center">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                    checked={selectedItems.size > 0 && selectedItems.size === session.items?.length}
                    onChange={toggleSelectAll}
                  />
                </TableHead>
              )}
              <TableHead className="font-semibold text-slate-600">Product / SKU</TableHead>
              {!isBlindCount && <TableHead className="font-semibold text-slate-600 text-right">System Qty (On Hand)</TableHead>}
              <TableHead className="font-semibold text-slate-600 text-right">Count Qty</TableHead>
              <TableHead className="font-semibold text-slate-600 text-right">Damaged Qty</TableHead>
              {!isBlindCount && <TableHead className="font-semibold text-slate-600 text-right">Variance</TableHead>}
              <TableHead className="font-semibold text-slate-600">Status</TableHead>
              {canSubmit && <TableHead className="font-semibold text-slate-600 w-[200px]">Notes</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {session.items?.map((item) => {
              const productName = item.product?.name || item.productVariant?.product?.name || "Unknown Product";
              const sku = item.sku || item.productVariant?.sku || item.product?.sku || "-";
              const isRecount = item.status === StockOpnameItemStatus.RECOUNT_REQUIRED;
              
              return (
                <TableRow key={item.id} className={isRecount ? "bg-rose-50/30" : ""}>
                  {canSubmit && (
                    <TableCell className="text-center">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                        checked={selectedItems.has(item.id)}
                        onChange={() => toggleSelect(item.id)}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">{productName}</span>
                      <span className="text-xs text-slate-500">SKU: {sku}</span>
                      {item.reservedOnlyWarning && (
                        <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 rounded mt-0.5 w-fit flex items-center gap-0.5">
                          <AlertCircle className="w-3 h-3" /> Has reserved stock
                        </span>
                      )}
                    </div>
                  </TableCell>
                  {!isBlindCount && (
                    <TableCell className="text-right font-medium text-slate-700">
                      {item.snapshotOnHand}
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    {canSubmit ? (
                      <Input 
                        type="number"
                        min="0"
                        className="w-24 text-right ml-auto h-8 text-sm"
                        value={counts[item.id]?.countedQuantity ?? ''}
                        onChange={(e) => handleCountChange(item.id, 'countedQuantity', e.target.value)}
                      />
                    ) : (
                      <span className="font-bold">{item.finalCountQuantity ?? "-"}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {canSubmit ? (
                      <Input 
                        type="number"
                        min="0"
                        className="w-20 text-right ml-auto h-8 text-sm"
                        value={counts[item.id]?.damagedQuantity ?? 0}
                        onChange={(e) => handleCountChange(item.id, 'damagedQuantity', e.target.value)}
                      />
                    ) : (
                      <span className="font-medium">{item.finalDamagedQuantity ?? 0}</span>
                    )}
                  </TableCell>
                  {!isBlindCount && (
                    <TableCell className="text-right">
                      {item.status === StockOpnameItemStatus.PENDING && !counts[item.id]?.countedQuantity ? (
                        <span className="text-slate-400">-</span>
                      ) : (
                        <span className={`font-bold ${item.varianceQuantity < 0 ? 'text-rose-600' : item.varianceQuantity > 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
                          {item.varianceQuantity > 0 ? '+' : ''}{item.varianceQuantity}
                        </span>
                      )}
                    </TableCell>
                  )}
                  <TableCell>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                      item.status === StockOpnameItemStatus.PENDING ? 'bg-slate-100 text-slate-600' :
                      item.status === StockOpnameItemStatus.COUNTED ? 'bg-indigo-100 text-indigo-700' :
                      item.status === StockOpnameItemStatus.RECOUNT_REQUIRED ? 'bg-rose-100 text-rose-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {item.status}
                    </span>
                  </TableCell>
                  {canSubmit && (
                    <TableCell>
                      <Input 
                        placeholder="Note (optional)"
                        className="h-8 text-sm"
                        value={counts[item.id]?.notes ?? ''}
                        onChange={(e) => handleNoteChange(item.id, e.target.value)}
                      />
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
