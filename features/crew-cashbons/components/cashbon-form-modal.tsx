import { useState, useEffect } from "react";
import { Modal } from "../../../components/ui/modal";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { CrewCashbonItem, CreateCrewCashbonPayload } from "../../../types/crew-cashbon";
import { Crew } from "../../../types/crew";
import { useBusinessUnits } from "../../business-units/hooks/use-business-units";
import { useAccounts } from "../../accounts/hooks/use-accounts";
import { useCategories } from "../../categories/hooks/use-categories";
import { crewApi } from "../../crew/api";
import { SearchableSelect } from "@/components/ui/searchable-select";

interface CashbonFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<CreateCrewCashbonPayload>) => Promise<void>;
  initialData?: CrewCashbonItem | null;
}

export function CashbonFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: CashbonFormModalProps) {
  const isEdit = !!initialData;
  const { data: businessUnits } = useBusinessUnits();
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();
  const [crews, setCrews] = useState<Crew[]>([]);

  const [formData, setFormData] = useState<Partial<CreateCrewCashbonPayload>>({});
  const [principalStr, setPrincipalStr] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      crewApi.getCrew({ limit: 100, status: "ACTIVE" }).then(res => {
        setCrews(res.data || []);
      }).catch(console.error);
    }
  }, [isOpen]);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevInitialData, setPrevInitialData] = useState(initialData);

  // If cashbon has payments, or is edit, principal/account can't be changed. 
  // Backend rules: do not expose editor for principalAmount, disbursementAccountId, categoryId during update.
  const isPaidOff = isEdit && initialData.status === "PAID_OFF";

  if (isOpen !== prevIsOpen || initialData !== prevInitialData) {
    setPrevIsOpen(isOpen);
    setPrevInitialData(initialData);
    if (isOpen) {
      if (initialData) {
        setFormData({
          crewId: initialData.crew.id,
          businessUnitId: initialData.businessUnit?.id || "",
          cashbonDate: initialData.cashbonDate.split("T")[0],
          dueDate: initialData.dueDate ? initialData.dueDate.split("T")[0] : "",
          principalAmount: parseFloat(initialData.principalAmount),
          purpose: (initialData as any).purpose || "",
          notes: (initialData as any).notes || "",
          attachmentUrl: (initialData as any).attachmentUrl || "",
        });
        setPrincipalStr(parseFloat(initialData.principalAmount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
      } else {
        setFormData({
          crewId: "",
          businessUnitId: "",
          disbursementAccountId: "",
          categoryId: "",
          cashbonDate: new Date().toISOString().split("T")[0],
          dueDate: "",
          principalAmount: 0,
          purpose: "",
          notes: "",
          attachmentUrl: "",
        });
        setPrincipalStr("");
      }
      setError(null);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload: Partial<CreateCrewCashbonPayload> = {
        ...formData,
        businessUnitId: formData.businessUnitId || null,
        dueDate: formData.dueDate || null,
        categoryId: formData.categoryId || null,
        purpose: formData.purpose || null,
        notes: formData.notes || null,
        attachmentUrl: formData.attachmentUrl || null,
      };

      await onSubmit(payload);
      onClose();
    } catch (err) {
      const e = err as {
        response?: { data?: { message?: string | string[] } };
      };
      const msg = e.response?.data?.message;
      setError(
        Array.isArray(msg) ? msg.join(", ") : msg || "Failed to save cashbon",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Cashbon Crew" : "Buat Cashbon Baru"}
      className="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm bg-rose-50 text-rose-600 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Crew *</Label>
            <SearchableSelect
              required
              disabled={isEdit}
              className="w-full h-10 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              value={formData.crewId || ""}
              onChange={(e) =>
                setFormData({ ...formData, crewId: e.target.value })
              }
            >
              <option value="" disabled>Pilih Crew</option>
              {crews.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
              {isEdit && !crews.find(c => c.id === formData.crewId) && (
                 <option value={formData.crewId}>{initialData?.crew.name}</option>
              )}
            </SearchableSelect>
          </div>

          <div className="space-y-2">
            <Label>Unit Bisnis</Label>
            <SearchableSelect
              disabled={isPaidOff}
              className="w-full h-10 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              value={formData.businessUnitId || ""}
              onChange={(e) =>
                setFormData({ ...formData, businessUnitId: e.target.value })
              }
            >
              <option value="">Semua / Global</option>
              {businessUnits?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </SearchableSelect>
          </div>

          {!isEdit && (
            <div className="space-y-2">
              <Label>Akun Pencairan (Disbursement) *</Label>
              <SearchableSelect
                required
                className="w-full h-10 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                value={formData.disbursementAccountId || ""}
                onChange={(e) =>
                  setFormData({ ...formData, disbursementAccountId: e.target.value })
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
          )}

          {!isEdit && (
             <div className="space-y-2">
               <Label>Kategori Akuntansi</Label>
               <SearchableSelect
                 className="w-full h-10 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
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
          )}

          <div className="space-y-2">
            <Label>Nominal Pokok (IDR) *</Label>
            <Input
              required
              type="text"
              inputMode="numeric"
              disabled={isEdit}
              value={principalStr}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setPrincipalStr(val.replace(/\B(?=(\d{3})+(?!\d))/g, "."));
                setFormData({
                  ...formData,
                  principalAmount: val ? parseFloat(val) : 0,
                });
              }}
              placeholder="Cth. 1.000.000"
            />
            {isEdit && (
              <p className="text-xs text-amber-600">
                Pokok cashbon tidak bisa diubah setelah dibuat
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tanggal Cashbon *</Label>
            <Input
              required
              type="date"
              disabled={isPaidOff}
              value={formData.cashbonDate || ""}
              onChange={(e) =>
                setFormData({ ...formData, cashbonDate: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Jatuh Tempo (Opsional)</Label>
            <Input
              type="date"
              disabled={isPaidOff}
              value={formData.dueDate || ""}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Tujuan (Purpose)</Label>
            <Input
              disabled={isPaidOff}
              value={formData.purpose || ""}
              onChange={(e) =>
                setFormData({ ...formData, purpose: e.target.value })
              }
              placeholder="Cth. Advance Operasional"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Catatan</Label>
          <Input
            value={formData.notes || ""}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder="Catatan tambahan"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Batal
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Cashbon"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
