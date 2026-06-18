import { useState, useEffect } from "react";
import { Modal } from "../../../components/ui/modal";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { DebtItem, CreateDebtPayload, DebtType } from "../../../types/debt";
import { useBusinessUnits } from "../../business-units/hooks/use-business-units";

interface DebtFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<CreateDebtPayload>) => Promise<void>;
  initialData?: DebtItem | null;
}

export function DebtFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: DebtFormModalProps) {
  const isEdit = !!initialData;
  const { data: businessUnits } = useBusinessUnits();

  const [formData, setFormData] = useState<Partial<CreateDebtPayload>>({
    type: "BANK_LOAN",
    interestRate: 0,
    monthlyInstallment: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If debt has payments, principal can't be changed
  const hasPayments = isEdit ? parseFloat(initialData.paidAmount) > 0 : false;
  const isPaidOff = isEdit && initialData.status === "PAID_OFF";

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevInitialData, setPrevInitialData] = useState(initialData);

  if (isOpen !== prevIsOpen || initialData !== prevInitialData) {
    setPrevIsOpen(isOpen);
    setPrevInitialData(initialData);
    if (isOpen) {
      if (initialData) {
        setFormData({
          businessUnitId: initialData.businessUnit?.id || "",
          debtName: initialData.debtName,
          lenderName: initialData.lenderName,
          type: initialData.type,
          principalAmount: parseFloat(initialData.principalAmount),
          startDate: initialData.startDate.split("T")[0],
          dueDate: initialData.dueDate ? initialData.dueDate.split("T")[0] : "",
          interestRate: initialData.interestRate
            ? parseFloat(initialData.interestRate)
            : 0,
          monthlyInstallment: initialData.monthlyInstallment
            ? parseFloat(initialData.monthlyInstallment)
            : 0,
          notes: initialData.notes || "",
        });
      } else {
        setFormData({
          businessUnitId: "",
          debtName: "",
          lenderName: "",
          type: "BANK_LOAN",
          principalAmount: 0,
          startDate: "",
          dueDate: "",
          interestRate: 0,
          monthlyInstallment: 0,
          notes: "",
        });
      }
      setError(null);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload: Partial<CreateDebtPayload> = {
        ...formData,
        businessUnitId: formData.businessUnitId || null,
        dueDate: formData.dueDate || null,
        notes: formData.notes || null,
      };

      if (isPaidOff) {
        // Only notes can be updated if paid off
        await onSubmit({ notes: payload.notes });
      } else {
        await onSubmit(payload);
      }
      onClose();
    } catch (err) {
      const e = err as {
        response?: { data?: { message?: string | string[] } };
      };
      const msg = e.response?.data?.message;
      setError(
        Array.isArray(msg) ? msg.join(", ") : msg || "Failed to save debt",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Hutang" : "Tambah Hutang Baru"}
      className="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm bg-rose-50 text-rose-600 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Nama Hutang *</Label>
            <Input
              required
              disabled={isPaidOff}
              value={formData.debtName || ""}
              onChange={(e) =>
                setFormData({ ...formData, debtName: e.target.value })
              }
              placeholder="Cth. KUR Mandiri"
            />
          </div>

          <div className="space-y-2">
            <Label>Pemberi Pinjaman (Kreditur) *</Label>
            <Input
              required
              disabled={isPaidOff}
              value={formData.lenderName || ""}
              onChange={(e) =>
                setFormData({ ...formData, lenderName: e.target.value })
              }
              placeholder="Cth. Bank Mandiri"
            />
          </div>

          <div className="space-y-2">
            <Label>Tipe Hutang *</Label>
            <select
              required
              disabled={isPaidOff}
              className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.type || "BANK_LOAN"}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as DebtType })
              }
            >
              <option value="BANK_LOAN">Pinjaman Bank</option>
              <option value="PERSONAL_LOAN">Pinjaman Pribadi</option>
              <option value="BUSINESS_CAPITAL">Modal Usaha</option>
              <option value="ASSET_PURCHASE">Pembelian Aset</option>
              <option value="CREDIT_CARD">Kartu Kredit</option>
              <option value="PAYABLE">Hutang Usaha (Payable)</option>
              <option value="OTHER">Lainnya</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Unit Bisnis</Label>
            <select
              disabled={isPaidOff}
              className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
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
            </select>
          </div>

          <div className="space-y-2">
            <Label>Nominal Pokok (IDR) *</Label>
            <Input
              required
              type="number"
              min="1"
              disabled={isPaidOff || hasPayments}
              value={formData.principalAmount || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  principalAmount: parseFloat(e.target.value),
                })
              }
              placeholder="Cth. 10000000"
            />
            {hasPayments && (
              <p className="text-xs text-amber-600">
                Pokok hutang tidak bisa diubah setelah ada cicilan
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Cicilan Bulanan (IDR) Estimasi</Label>
            <Input
              type="number"
              min="0"
              disabled={isPaidOff}
              value={formData.monthlyInstallment || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  monthlyInstallment: parseFloat(e.target.value),
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Tanggal Mulai *</Label>
            <Input
              required
              type="date"
              disabled={isPaidOff}
              value={formData.startDate || ""}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
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
            <Label>Suku Bunga / Interest (%)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              disabled={isPaidOff}
              value={formData.interestRate || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  interestRate: parseFloat(e.target.value),
                })
              }
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
            {loading ? "Menyimpan..." : "Simpan Hutang"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
