import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Wallet } from "lucide-react";
import {
  DebtInstallmentItem,
  PayDebtInstallmentPayload,
} from "../../../types/installment";
import { Account } from "../../../types/account";
import api from "../../../lib/axios";
import { ListResponse } from "../../../types/common";
import { Category } from "../../../types/category";
import { SearchableSelect } from "@/components/ui/searchable-select";

interface InstallmentPaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  installment: DebtInstallmentItem | null;
  onSubmit: (data: PayDebtInstallmentPayload) => Promise<void>;
}

export function InstallmentPaymentFormModal({
  isOpen,
  onClose,
  installment,
  onSubmit,
}: InstallmentPaymentFormModalProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [paymentDate, setPaymentDate] = useState("");
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isOpen) {
      setPaymentDate(new Date().toISOString().split("T")[0]);
      setAccountId("");
      setAmount(
        installment?.remainingAmount
          ? parseFloat(installment.remainingAmount)
              .toString()
              .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
          : "",
      );
      setCategoryId("");
      setDescription(
        `Pembayaran untuk cicilan ${installment?.installmentCode || ""}`,
      );
      setNotes("");
      setError(null);

      // Fetch active accounts and categories
      Promise.all([
        api.get<ListResponse<Account>>("/accounts?limit=100&status=ACTIVE"),
        api.get<ListResponse<Category>>("/categories?limit=100&status=ACTIVE"),
      ])
        .then(([accRes, catRes]) => {
          setAccounts(accRes.data.data);
          setCategories(catRes.data.data);
        })
        .catch(() => setError("Failed to load master data"));
    }
  }, [isOpen, installment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId) {
      setError("Please select an account");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload: PayDebtInstallmentPayload = {
        paymentDate,
        accountId,
        amount: parseFloat(amount.replace(/\./g, "")),
        categoryId: categoryId || undefined,
        description: description || undefined,
        notes: notes || undefined,
      };
      await onSubmit(payload);
      onClose();
    } catch (err) {
      const e = err as {
        response?: { data?: { message?: string | string[] } };
      };
      const msg = e.response?.data?.message;
      setError(
        Array.isArray(msg) ? msg.join(", ") : msg || "Failed to submit payment",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-white p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
              <Wallet className="h-5 w-5" />
              Lakukan Pembayaran Cicilan
            </DialogTitle>
          </DialogHeader>
          <p className="text-emerald-100 text-sm mt-2 opacity-90">
            Catat pembayaran untuk cicilan ini. Ini juga akan membuat transaksi
            pengeluaran pada Cashflow.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-600 text-sm rounded-xl border border-rose-100 flex gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {installment && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm grid grid-cols-2 gap-2">
              <div>
                <p className="text-slate-500 text-xs">Hutang</p>
                <p className="font-medium text-slate-800">
                  {installment.debt?.debtName}
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">Kode Cicilan</p>
                <p className="font-medium text-slate-800">
                  {installment.installmentCode}
                </p>
              </div>
              <div className="col-span-2 mt-1">
                <p className="text-slate-500 text-xs flex justify-between">
                  <span>Sisa Tagihan</span>
                  <span className="font-bold text-rose-600">
                    Rp{" "}
                    {parseFloat(installment.remainingAmount).toLocaleString(
                      "id-ID",
                    )}
                  </span>
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-slate-700">
                Tanggal Pembayaran <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="date"
                required
                className="h-10 rounded-xl"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-700">
                Nominal Pembayaran <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="text"
                inputMode="numeric"
                required
                className="h-10 rounded-xl"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setAmount(val.replace(/\B(?=(\d{3})+(?!\d))/g, "."));
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-slate-700">
                Akun (Sumber Dana) <span className="text-rose-500">*</span>
              </Label>
              <SearchableSelect
                className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                required
              >
                <option value="">Pilih Akun</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </SearchableSelect>
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-700">Kategori (Opsional)</Label>
              <SearchableSelect
                className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Kategori Hutang Default</option>
                {categories.some((c) => c.type === "IN") && (
                  <optgroup label="Pemasukan saja">
                    {categories
                      .filter((c) => c.type === "IN")
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </optgroup>
                )}
                {categories.some((c) => c.type === "OUT") && (
                  <optgroup label="Pengeluaran saja">
                    {categories
                      .filter((c) => c.type === "OUT")
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </optgroup>
                )}
                {categories.some((c) => c.type === "BOTH") && (
                  <optgroup label="Bisa keduanya">
                    {categories
                      .filter((c) => c.type === "BOTH")
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </optgroup>
                )}
              </SearchableSelect>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-700">Deskripsi (Opsional)</Label>
            <Input
              placeholder="Deskripsi singkat"
              className="h-10 rounded-xl"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-700">Catatan (Opsional)</Label>
            <Textarea
              placeholder="Catatan internal..."
              className="resize-none rounded-xl"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-sm shadow-emerald-200 transition-colors disabled:opacity-70 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Memproses...
                </>
              ) : (
                "Simpan Pembayaran"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
