import { useState, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertTriangle, ArrowRightLeft } from "lucide-react";
import { SalesOrder, CreateSalesOrderRefundRequest } from "@/types/sales-order";
import { formatMoney } from "@/lib/utils";
import { useAccounts } from "@/features/accounts/hooks/use-accounts";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { CurrencyInput } from "@/components/ui/currency-input";
import toast from "react-hot-toast";

interface RefundCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSalesOrderRefundRequest) => Promise<void>;
  isLoading: boolean;
  order: SalesOrder | undefined;
}

export function RefundCreateModal({ isOpen, onClose, onSubmit, isLoading, order }: RefundCreateModalProps) {
  const { data: accounts } = useAccounts();
  const { allCategories } = useCategories();

  const outCategories = useMemo(() => allCategories.filter(c => c.type === "OUT" && c.status === "ACTIVE"), [allCategories]);
  const activeAccounts = useMemo(() => accounts.filter(a => a.status === "ACTIVE"), [accounts]);

  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState("BANK_TRANSFER");
  const [returnToStock, setReturnToStock] = useState(false);
  const [notes, setNotes] = useState("");

  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});

  // Reset state when opened
  useMemo(() => {
    if (isOpen) {
      setDate(new Date().toISOString().split("T")[0]);
      setAccountId("");
      setCategoryId("");
      setAmount(0);
      setMethod("BANK_TRANSFER");
      setReturnToStock(false);
      setNotes("");
      setItemQuantities({});
    }
  }, [isOpen]);

  if (!order) return null;

  // Calculation for max refund
  const totalPaid = order.payments?.filter(p => p.status === 'POSTED').reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;
  const totalRefunded = order.refunds?.filter(r => r.status === 'POSTED').reduce((sum, r) => sum + parseFloat(r.amount), 0) || 0;
  const netPaid = totalPaid - totalRefunded;

  // Calculate already returned quantities
  const alreadyReturnedMap = useMemo(() => {
    const map: Record<string, number> = {};
    if (!order?.refunds) return map;
    
    order.refunds.forEach(refund => {
      if (refund.status === 'VOID' || !refund.returnToStock || !refund.items) return;
      refund.items.forEach(item => {
        map[item.salesOrderItemId] = (map[item.salesOrderItemId] || 0) + item.quantity;
      });
    });
    return map;
  }, [order]);

  // Calculate max refundable based on partial return
  const maxRefundableAmount = useMemo(() => {
    if (!order || !returnToStock) return netPaid;
    
    const itemsSelected = Object.entries(itemQuantities).filter(([_, qty]) => qty > 0);
    
    let max = 0;
    if (itemsSelected.length > 0) {
      itemsSelected.forEach(([itemId, qty]) => {
        const orderItem = order.items.find(i => i.id === itemId);
        if (orderItem) {
          const valPerItem = parseFloat(orderItem.subtotal) / orderItem.quantity;
          max += valPerItem * qty;
        }
      });
    } else {
      // Fallback: all remaining returnable items
      order.items.forEach(orderItem => {
        const returned = alreadyReturnedMap[orderItem.id] || 0;
        const remaining = orderItem.quantity - returned;
        if (remaining > 0) {
          const valPerItem = parseFloat(orderItem.subtotal) / orderItem.quantity;
          max += valPerItem * remaining;
        }
      });
    }
    
    return Math.min(max, netPaid);
  }, [order, returnToStock, itemQuantities, netPaid, alreadyReturnedMap]);

  const handleQtyChange = (itemId: string, maxQty: number, val: string) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 0) {
      setItemQuantities(prev => ({ ...prev, [itemId]: 0 }));
      return;
    }
    if (num > maxQty) {
      setItemQuantities(prev => ({ ...prev, [itemId]: maxQty }));
      return;
    }
    setItemQuantities(prev => ({ ...prev, [itemId]: num }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || amount <= 0) {
      toast.error("Refund amount must be greater than 0");
      return;
    }

    if (amount > maxRefundableAmount) {
      toast.error(`Refund amount cannot exceed allocated item value (${formatMoney(maxRefundableAmount)})`);
      return;
    }

    const payload: CreateSalesOrderRefundRequest = {
      refundDate: new Date(date),
      accountId,
      amount: amount.toString(),
      method,
      notes,
    };

    if (categoryId) payload.categoryId = categoryId;
    if (returnToStock) {
      payload.returnToStock = true;
      const items = Object.entries(itemQuantities)
        .filter(([_, qty]) => qty > 0)
        .map(([salesOrderItemId, quantity]) => ({ salesOrderItemId, quantity }));
      
      if (items.length > 0) {
        payload.items = items;
      }
    }

    await onSubmit(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Issue Refund" className="max-w-3xl">
      <form onSubmit={handleFormSubmit} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-sm text-slate-500 mb-1">Total Paid</p>
            <p className="font-semibold text-slate-900">{formatMoney(totalPaid)}</p>
          </div>
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
            <p className="text-sm text-emerald-600 mb-1">Net Paid (Refundable)</p>
            <p className="font-bold text-emerald-700 text-lg">{formatMoney(netPaid)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Date <span className="text-red-500">*</span></Label>
            <Input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="space-y-2 relative">
            <Label>Refund Amount <span className="text-red-500">*</span></Label>
            <CurrencyInput
              required
              placeholder="Rp 0"
              value={amount}
              onChange={setAmount}
              className={amount > maxRefundableAmount ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {returnToStock && (
              <p className="text-[10px] text-slate-500 absolute -bottom-5">
                Max allocated value: {formatMoney(maxRefundableAmount)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Payout Account <span className="text-red-500">*</span></Label>
            <SearchableSelect required value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              <option value="">-- Select Account --</option>
              {activeAccounts.map(a => (
                <option key={a.id} value={a.id}>{a.name} ({a.accountNumber || "Cash"})</option>
              ))}
            </SearchableSelect>
          </div>

          <div className="space-y-2">
            <Label>Method <span className="text-red-500">*</span></Label>
            <select
              className="w-full h-10 rounded-md border border-slate-200 px-3 text-sm focus:ring-2 focus:ring-primary-500"
              required
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CASH">Cash</option>
              <option value="EWALLET">E-Wallet</option>
              <option value="MARKETPLACE_BALANCE">Marketplace Balance</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Expense Category (Opt)</Label>
            <SearchableSelect value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">-- Default Refund Category --</option>
              {outCategories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </SearchableSelect>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Notes</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Reason for refund..." />
          </div>
        </div>

        {order.status === 'FULFILLED' && (
          <div className="border border-slate-200 rounded-xl overflow-hidden mt-6">
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <Label className="text-base font-semibold flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    checked={returnToStock}
                    onChange={(e) => setReturnToStock(e.target.checked)}
                  />
                  Return physical items to stock
                </Label>
                <p className="text-sm text-slate-500 mt-1">If enabled, physical stock will be added back to the warehouse.</p>
              </div>
            </div>

            {returnToStock && (
              <div className="p-4 bg-white">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p>Enter the quantity of items being returned. If you leave all inputs at 0, the backend will automatically return ALL remaining returnable items.</p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Item</th>
                        <th className="px-4 py-3">Price</th>
                        <th className="px-4 py-3 text-center">Ordered</th>
                        <th className="px-4 py-3 text-center text-amber-600">Returned</th>
                        <th className="px-4 py-3 text-center text-emerald-600">Remaining</th>
                        <th className="px-4 py-3 text-right">Return Qty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {order.items.map((item) => {
                        const returned = alreadyReturnedMap[item.id] || 0;
                        const remaining = item.quantity - returned;
                        return (
                          <tr key={item.id} className={remaining === 0 ? "bg-slate-50 opacity-60" : ""}>
                            <td className="px-4 py-3 font-medium">
                              {item.product?.name || "Unknown"}
                              {item.product?.sku && <span className="block text-xs text-slate-500">{item.product.sku}</span>}
                            </td>
                            <td className="px-4 py-3 text-slate-600">{formatMoney(item.price)}</td>
                            <td className="px-4 py-3 text-center">{item.quantity}</td>
                            <td className="px-4 py-3 text-center text-amber-600 font-medium">{returned}</td>
                            <td className="px-4 py-3 text-center text-emerald-600 font-bold">{remaining}</td>
                            <td className="px-4 py-3 text-right">
                              <Input
                                type="number"
                                min="0"
                                max={remaining}
                                value={itemQuantities[item.id] === 0 ? "" : (itemQuantities[item.id] || "")}
                                onChange={(e) => handleQtyChange(item.id, remaining, e.target.value)}
                                disabled={remaining === 0}
                                className="w-24 ml-auto text-right h-8"
                                placeholder="0"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || netPaid <= 0 || !accountId || !amount || amount > maxRefundableAmount}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRightLeft className="w-4 h-4 mr-2" />}
            Submit Refund
          </Button>
        </div>
      </form>
    </Modal>
  );
}
