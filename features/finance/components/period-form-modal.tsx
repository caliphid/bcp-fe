import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { financeApi } from "../api";
import { toast } from "react-hot-toast";
import { extractErrorMessage } from "@/lib/error";

interface PeriodFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PeriodFormModal({ isOpen, onClose, onSuccess }: PeriodFormModalProps) {
  const [loading, setLoading] = useState(false);
  
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  const [formData, setFormData] = useState({
    year: currentYear,
    month: currentMonth,
    notes: ""
  });

  const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const MONTHS = [
    { value: 1, label: "Januari" },
    { value: 2, label: "Februari" },
    { value: 3, label: "Maret" },
    { value: 4, label: "April" },
    { value: 5, label: "Mei" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "Agustus" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Desember" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await financeApi.createFinancialPeriod({
        year: formData.year,
        month: formData.month,
        notes: formData.notes || undefined
      });
      toast.success("Periode finansial berhasil dibuat");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(extractErrorMessage(error, "Gagal membuat periode finansial"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buat Periode Tutup Buku">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Tahun</Label>
            <SearchableSelect
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </SearchableSelect>
          </div>
          <div className="space-y-1.5">
            <Label>Bulan</Label>
            <SearchableSelect
              value={formData.month}
              onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })}
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </SearchableSelect>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Catatan (Opsional)</Label>
          <Input 
            placeholder="Contoh: Periode pembukuan bulan berjalan..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Menyimpan..." : "Buat Periode"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
