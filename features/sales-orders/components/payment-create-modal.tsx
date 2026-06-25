import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAccounts } from "@/features/accounts/hooks/use-accounts";
import { SalesOrder, CreateSalesOrderPaymentRequest } from "@/types/sales-order";
import { Loader2, DollarSign } from "lucide-react";
import toast from "react-hot-toast";

interface PaymentCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: SalesOrder;
  onSubmit: (data: CreateSalesOrderPaymentRequest) => Promise<void>;
  isLoading: boolean;
}

export function PaymentCreateModal({
  isOpen,
  onClose,
  order,
  onSubmit,
  isLoading,
}: PaymentCreateModalProps) {
  const { data: accounts } = useAccounts();
  const [formData, setFormData] = useState({
    paymentDate: new Date().toISOString().split("T")[0],
    accountId: "",
    amount: "",
    notes: "",
  });

  const grandTotal = parseFloat(order.grandTotal || "0");
  const paidAmount = order.payments?.filter(p => p.status === 'POSTED').reduce((acc, p) => acc + parseFloat(p.amount), 0) || 0;
  const remainingBalance = grandTotal - paidAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.accountId) {
      toast.error("Pilih akun tujuan pembayaran");
      return;
    }
    const amountVal = parseFloat(formData.amount);
    if (isNaN(amountVal) || amountVal <= 0) {
      toast.error("Nominal pembayaran harus lebih besar dari 0");
      return;
    }
    if (amountVal > remainingBalance) {
      toast.error(`Nominal melebihi sisa tagihan (Maks: Rp ${remainingBalance.toLocaleString("id-ID")})`);
      return;
    }

    await onSubmit({
      paymentDate: formData.paymentDate,
      accountId: formData.accountId,
      amount: formData.amount,
      notes: formData.notes,
    });
    
    // Reset
    setFormData({
      paymentDate: new Date().toISOString().split("T")[0],
      accountId: "",
      amount: "",
      notes: "",
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={isLoading ? () => {} : onClose} title="Create Payment">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Terima Pembayaran</h2>
            <p className="text-sm text-slate-500">Sales Order {order.orderCode}</p>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl mb-6 border border-slate-200">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-slate-500">Total Tagihan</span>
            <span className="text-sm font-medium">Rp {grandTotal.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-200">
            <span className="text-sm text-slate-500">Sudah Dibayar</span>
            <span className="text-sm font-medium text-emerald-600">Rp {paidAmount.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-slate-700">Sisa Tagihan</span>
            <span className="text-lg font-bold text-rose-600">Rp {remainingBalance.toLocaleString("id-ID")}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Tanggal Pembayaran</Label>
            <Input
              type="date"
              required
              disabled={isLoading}
              value={formData.paymentDate}
              onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Akun Penerima (Cash In)</Label>
            <select
              className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
              disabled={isLoading}
              value={formData.accountId}
              onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
            >
              <option value="">-- Pilih Akun --</option>
              {accounts?.map((acc: any) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Nominal Pembayaran</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">Rp</span>
              <Input
                type="number"
                required
                min="1"
                step="0.01"
                max={remainingBalance}
                disabled={isLoading}
                className="pl-10 font-medium"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder={remainingBalance.toString()}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, amount: remainingBalance.toString() })}
                className="text-xs text-primary-600 font-medium hover:underline"
              >
                Isi Full (Pelunasan)
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Catatan (Opsional)</Label>
            <Input
              disabled={isLoading}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Contoh: DP 50% via Transfer BCA"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Batal
            </Button>
            <Button type="submit" variant="default" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700">
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Simpan Pembayaran
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
