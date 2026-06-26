import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Info, Play, CheckCircle2, ShieldCheck, ClipboardList, PackageCheck } from "lucide-react";

interface InstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InstructionModal({ isOpen, onClose }: InstructionModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tutorial Stock Opname" className="max-w-2xl">
      <div className="space-y-6 text-slate-600 pb-2">
        <p className="text-sm">
          Modul <strong>Stock Opname</strong> digunakan untuk menyesuaikan stok fisik di gudang dengan data stok di sistem. Berikut adalah alur kerjanya:
        </p>

        <div className="space-y-4">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
              <Play className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">1. Buat Sesi (Create Session)</h4>
              <p className="text-xs mt-1">Admin/Owner membuat sesi hitung. Tipe "Full" untuk seluruh gudang, "Partial" untuk sebagian produk. Mode "Blind Count" akan menyembunyikan stok sistem dari staff lapangan.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <ClipboardList className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">2. Proses Hitung (Counting)</h4>
              <p className="text-xs mt-1">Staff lapangan atau PIC memasukkan jumlah fisik dan jumlah rusak untuk setiap produk. Setelah selesai, sesi bisa di-submit untuk masuk ke tahap review.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">3. Review & Approval</h4>
              <p className="text-xs mt-1">Sistem otomatis menghitung selisih (Variance). Admin harus melakukan Review, dilanjutkan dengan Approval oleh atasan (Owner/Admin lain). Catatan wajib diisi jika ada selisih.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
              <PackageCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">4. Posting Stok (Post Inventory)</h4>
              <p className="text-xs mt-1">Langkah terakhir untuk mengunci sesi. Sistem akan membuat Jurnal Stok untuk menyesuaikan stok sistem (Surplus/Shortage) sesuai dengan hasil hitungan fisik.</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex gap-3 mt-4">
          <Info className="w-5 h-5 text-slate-500 shrink-0" />
          <div className="text-xs text-slate-500">
            <strong>Catatan Penting:</strong> Sesi yang sudah berstatus <span className="font-semibold text-slate-700">POSTED</span> tidak dapat diubah lagi, kecuali menggunakan fitur <em>Void</em> oleh Owner/Admin.
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <Button onClick={onClose} className="bg-slate-900 hover:bg-slate-800 text-white">
            Mengerti
          </Button>
        </div>
      </div>
    </Modal>
  );
}
