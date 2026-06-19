import { useState } from "react";
import { Modal } from "../../../components/ui/modal";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { PostAdsReportPayload } from "../../../types/ads";
import { useAccounts } from "../../accounts/hooks/use-accounts";
import { useCategories } from "../../categories/hooks/use-categories";
import { AlertCircle } from "lucide-react";
import { SearchableSelect } from "@/components/ui/searchable-select";

interface PostReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PostAdsReportPayload) => Promise<void>;
  reportCode: string;
}

export function PostReportModal({
  isOpen,
  onClose,
  onSubmit,
  reportCode,
}: PostReportModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();

  const [formData, setFormData] = useState<PostAdsReportPayload>({
    revenueAccountId: "",
    expenseAccountId: "",
    revenueCategoryId: "",
    adSpendCategoryId: "",
    platformFeeCategoryId: "",
    taxCategoryId: "",
    otherCostCategoryId: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.revenueAccountId || !formData.expenseAccountId) {
      setError("Revenue Account dan Expense Account wajib diisi.");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      const e = err as { response?: { data?: { message?: string | string[] } } };
      const msg = e.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(", ") : msg || "Failed to post report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Post Report ke Cashflow"
      className="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm bg-rose-50 text-rose-600 rounded-lg">
            {error}
          </div>
        )}

        <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-indigo-500 mt-0.5 shrink-0" />
          <div className="text-sm text-indigo-900">
            <strong>Penting:</strong> Setelah report <span className="font-mono">{reportCode}</span> di-post, sistem akan membuat transaksi pemasukan (Revenue) dan pengeluaran (Cost) secara otomatis. Report ini tidak bisa di-edit kembali secara bebas.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Akun Penerima (Revenue) <span className="text-rose-500">*</span></Label>
            <SearchableSelect
              required
              className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.revenueAccountId}
              onChange={(e) => setFormData({ ...formData, revenueAccountId: e.target.value })}
            >
              <option value="" disabled>Pilih Akun Bank/Cash</option>
              {accounts?.map((acc) => (
                <option key={acc.id} value={acc.id}>{acc.name} ({acc.accountNumber})</option>
              ))}
            </SearchableSelect>
          </div>
          <div className="space-y-2">
            <Label>Kategori Revenue</Label>
            <SearchableSelect
              className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.revenueCategoryId || ""}
              onChange={(e) => setFormData({ ...formData, revenueCategoryId: e.target.value })}
            >
              <option value="">Pilih Kategori (Opt)</option>
              {categories?.filter(c => c.type === "IN" || c.type === "BOTH").map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </SearchableSelect>
          </div>

          <div className="space-y-2">
            <Label>Akun Pengeluaran (Expense) <span className="text-rose-500">*</span></Label>
            <SearchableSelect
              required
              className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.expenseAccountId}
              onChange={(e) => setFormData({ ...formData, expenseAccountId: e.target.value })}
            >
              <option value="" disabled>Pilih Akun Bank/Cash</option>
              {accounts?.map((acc) => (
                <option key={acc.id} value={acc.id}>{acc.name} ({acc.accountNumber})</option>
              ))}
            </SearchableSelect>
          </div>
          <div className="space-y-2">
            <Label>Kategori Ad Spend</Label>
            <SearchableSelect
              className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.adSpendCategoryId || ""}
              onChange={(e) => setFormData({ ...formData, adSpendCategoryId: e.target.value })}
            >
              <option value="">Pilih Kategori (Opt)</option>
              {categories?.filter(c => c.type === "OUT" || c.type === "BOTH").map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </SearchableSelect>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Memproses..." : "Post Report"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
