import { useState, useEffect } from "react";
import { Modal } from "../../../components/ui/modal";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { CreateCashbonRepaymentPayload, CashbonRepaymentMethod } from "../../../types/crew-cashbon";
import { useAccounts } from "../../accounts/hooks/use-accounts";
import { useCategories } from "../../categories/hooks/use-categories";
import { Info } from "lucide-react";
import { SearchableSelect } from "@/components/ui/searchable-select";

interface RepaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCashbonRepaymentPayload) => Promise<void>;
  maxAmount: number;
}

export function RepaymentFormModal({
  isOpen,
  onClose,
  onSubmit,
  maxAmount,
}: RepaymentFormModalProps) {
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();

  const [formData, setFormData] = useState<Partial<CreateCashbonRepaymentPayload>>({
    method: "CASH",
  });
  const [amountStr, setAmountStr] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setFormData({
        method: "CASH",
        accountId: "",
        categoryId: "",
        repaymentDate: new Date().toISOString().split("T")[0],
        amount: 0,
        description: "",
        notes: "",
        attachmentUrl: "",
      });
      setAmountStr("");
      setError(null);
    }
  }

  const isPayrollDeduction = formData.method === "PAYROLL_DEDUCTION";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (!isPayrollDeduction && !formData.accountId) {
        throw new Error("Akun pembayaran (Account) wajib diisi untuk metode ini.");
      }

      if (!formData.amount || formData.amount <= 0) {
        throw new Error("Nominal pembayaran harus lebih dari 0.");
      }

      if (formData.amount > maxAmount) {
        throw new Error(`Nominal pembayaran tidak boleh melebihi sisa hutang (${maxAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")})`);
      }

      const payload: CreateCashbonRepaymentPayload = {
        repaymentDate: formData.repaymentDate!,
        amount: formData.amount,
        method: formData.method as CashbonRepaymentMethod,
        accountId: isPayrollDeduction ? null : formData.accountId,
        categoryId: formData.categoryId || null,
        description: formData.description || null,
        notes: formData.notes || null,
        attachmentUrl: formData.attachmentUrl || null,
      };

      await onSubmit(payload);
      onClose();
    } catch (err) {
      const e = err as {
        response?: { data?: { message?: string | string[] } };
        message?: string;
      };
      const msg = e.response?.data?.message || e.message;
      setError(
        Array.isArray(msg) ? msg.join(", ") : msg || "Failed to process repayment",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Catat Pembayaran Cashbon"
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm bg-rose-50 text-rose-600 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Metode Pembayaran *</Label>
            <SearchableSelect
              required
              className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.method || "CASH"}
              onChange={(e) =>
                setFormData({ ...formData, method: e.target.value as CashbonRepaymentMethod })
              }
            >
              <option value="CASH">Tunai</option>
              <option value="BANK_TRANSFER">Transfer Bank</option>
              <option value="PAYROLL_DEDUCTION">Potong Gaji</option>
              <option value="OTHER">Lainnya</option>
            </SearchableSelect>
          </div>

          <div className="space-y-2">
            <Label>Tanggal Pembayaran *</Label>
            <Input
              required
              type="date"
              value={formData.repaymentDate || ""}
              onChange={(e) =>
                setFormData({ ...formData, repaymentDate: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Akun Penerima (Kas/Bank) {isPayrollDeduction ? "(Opsional)" : "*"}</Label>
            <SearchableSelect
              required={!isPayrollDeduction}
              disabled={isPayrollDeduction}
              className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:opacity-50"
              value={formData.accountId || ""}
              onChange={(e) =>
                setFormData({ ...formData, accountId: e.target.value })
              }
            >
              <option value="" disabled>Pilih Akun</option>
              {accounts?.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.bankName})
                </option>
              ))}
            </SearchableSelect>
          </div>

          <div className="space-y-2">
            <Label>Kategori Akuntansi</Label>
            <SearchableSelect
              className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.categoryId || ""}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
            >
              <option value="">Pilih Kategori</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </SearchableSelect>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Nominal Pembayaran (IDR) *</Label>
            <Input
              required
              type="text"
              inputMode="numeric"
              value={amountStr}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setAmountStr(val.replace(/\B(?=(\d{3})+(?!\d))/g, "."));
                setFormData({
                  ...formData,
                  amount: val ? parseFloat(val) : 0,
                });
              }}
              placeholder="Cth. 500.000"
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-slate-500">
                Sisa Hutang: {maxAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
              </span>
              <button
                type="button"
                onClick={() => {
                  setAmountStr(maxAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
                  setFormData({ ...formData, amount: maxAmount });
                }}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Bayar Lunas
              </button>
            </div>
          </div>
          
          <div className="space-y-2 md:col-span-2">
             <Label>Keterangan</Label>
             <Input
               value={formData.description || ""}
               onChange={(e) =>
                 setFormData({ ...formData, description: e.target.value })
               }
               placeholder="Cth. Cicilan bulan Juli"
             />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Catatan / Referensi</Label>
            <Input
              value={formData.notes || ""}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Catatan tambahan"
            />
          </div>
        </div>

        {isPayrollDeduction && (
          <div className="mt-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex gap-3 text-sm text-blue-800 items-start">
            <Info className="h-4 w-4 mt-0.5 shrink-0 text-blue-600" />
            <div>
              <p className="font-semibold text-blue-900 mb-0.5">Potong Gaji (Payroll Deduction)</p>
              <p>Metode ini secara default tidak akan mencatat mutasi uang masuk pada menu Transactions karena hanya merupakan potongan nilai dari gaji yang dibayarkan ke Crew.</p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Batal
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Memproses..." : "Simpan Pembayaran"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
