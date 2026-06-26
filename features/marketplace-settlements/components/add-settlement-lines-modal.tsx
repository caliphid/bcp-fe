import { useState } from "react";
import { Modal } from "../../../components/ui/modal";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { marketplaceSettlementApi } from "../api";
import { extractErrorMessage } from "../../../lib/error";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Loader2, Plus, Trash2, HelpCircle } from "lucide-react";
import toast from "react-hot-toast";
import { MarketplaceSettlementLineType, MarketplaceAdjustmentDirection } from "../../../types/marketplace";
import { useTranslation } from "../../../hooks/use-translation";

interface AddSettlementLinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  settlementId: string;
  onSuccess: () => void;
}

const LINE_TYPES = [
  'ORDER_PROCEEDS', 'PLATFORM_FEE', 'ADMIN_FEE', 'SERVICE_FEE', 'COMMISSION',
  'SHIPPING_CHARGE', 'SHIPPING_SUBSIDY', 'SHIPPING_ADJUSTMENT', 'VOUCHER',
  'DISCOUNT', 'TAX', 'REFUND', 'PENALTY', 'OTHER_INCOME', 'OTHER_DEDUCTION', 'MANUAL_ADJUSTMENT'
];

export function AddSettlementLinesModal({ isOpen, onClose, settlementId, onSuccess }: AddSettlementLinesModalProps) {
  const defaultLine = {
    externalOrderId: "",
    externalTransactionId: "",
    lineType: "ORDER_PROCEEDS" as MarketplaceSettlementLineType,
    direction: "INCREASE" as MarketplaceAdjustmentDirection,
    description: "",
    rawCustomerName: "",
    rawCustomerPhone: "",
    rawCustomerAddress: "",
    amount: 0,
  };

  const [lines, setLines] = useState<typeof defaultLine[]>([]);
  const [addingRow, setAddingRow] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [formData, setFormData] = useState({ ...defaultLine });
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  const handleStartAdd = () => {
    setFormData({ ...defaultLine });
    setAddingRow(true);
    setError(null);
  };

  const handleCancelAdd = () => {
    setAddingRow(false);
    setError(null);
  };

  const handleSaveRow = () => {
    if (formData.amount <= 0 || !formData.lineType || !formData.direction) {
      setError("Please ensure the line has a valid amount (> 0), type, and direction.");
      return;
    }
    setLines([...lines, { ...formData }]);
    setAddingRow(false);
    setError(null);
  };

  const handleRemoveRow = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (lines.length === 0) {
      setError("Please add at least one line before saving.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await marketplaceSettlementApi.addSettlementLines(settlementId, {
        lines: lines.map(l => ({
          ...l,
          externalOrderId: l.externalOrderId || undefined,
          externalTransactionId: l.externalTransactionId || undefined,
          description: l.description || undefined,
          rawCustomerName: l.rawCustomerName || undefined,
          rawCustomerPhone: l.rawCustomerPhone || undefined,
          rawCustomerAddress: l.rawCustomerAddress || undefined,
        }))
      });
      toast.success("Lines added successfully");
      onSuccess();
      setLines([]);
      onClose();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={t("marketplace.settlement.addLines.title")} className="max-w-7xl">
        <div className="space-y-6 relative">
          
          <div className="absolute -top-12 right-12 z-10">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowTutorial(true)} className="bg-white hover:bg-slate-50 text-indigo-600 border-indigo-200">
              <HelpCircle className="w-4 h-4 mr-2" />
              Cara Penggunaan
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        
        {/* Read-only table of added lines */}
        {lines.length > 0 && (
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-3 text-left font-semibold min-w-[150px]">Ext Order ID</th>
                  <th className="p-3 text-left font-semibold min-w-[150px]">Ext Trans ID</th>
                  <th className="p-3 text-left font-semibold min-w-[150px]">Type</th>
                  <th className="p-3 text-left font-semibold min-w-[100px]">Direction</th>
                  <th className="p-3 text-right font-semibold min-w-[120px]">Amount</th>
                  <th className="p-3 text-left font-semibold min-w-[150px]">Description</th>
                  <th className="p-3 text-left font-semibold min-w-[150px]">Customer Name</th>
                  <th className="p-3 text-left font-semibold min-w-[50px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lines.map((line, idx) => (
                  <tr key={idx} className="bg-white hover:bg-slate-50/50">
                    <td className="p-3 text-slate-700">{line.externalOrderId || '-'}</td>
                    <td className="p-3 text-slate-700">{line.externalTransactionId || '-'}</td>
                    <td className="p-3 text-slate-700">{line.lineType}</td>
                    <td className="p-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${line.direction === 'INCREASE' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {line.direction}
                      </span>
                    </td>
                    <td className="p-3 text-right font-medium text-slate-900">{line.amount.toLocaleString()}</td>
                    <td className="p-3 text-slate-700">{line.description || '-'}</td>
                    <td className="p-3 text-slate-700">{line.rawCustomerName || '-'}</td>
                    <td className="p-3 text-center">
                      <button type="button" onClick={() => handleRemoveRow(idx)} className="text-slate-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {lines.length === 0 && !addingRow && (
          <div className="text-center py-8 bg-slate-50 border border-slate-100 border-dashed rounded-xl">
            <p className="text-slate-500 text-sm">No lines added yet. Click "+ Add Row" to begin.</p>
          </div>
        )}

        {/* Inline Form to Add a Line */}
        {addingRow ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
            <h4 className="font-semibold text-slate-800 mb-4 text-sm">Add New Line</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Ext Order ID</label>
                <Input className="h-9 text-sm" placeholder="e.g. ORD-123" value={formData.externalOrderId} onChange={e => handleChange('externalOrderId', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Ext Trans ID</label>
                <Input className="h-9 text-sm" placeholder="e.g. TRN-123" value={formData.externalTransactionId} onChange={e => handleChange('externalTransactionId', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Type <span className="text-red-500">*</span></label>
                <select className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.lineType} onChange={e => handleChange('lineType', e.target.value)}>
                  {LINE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Direction <span className="text-red-500">*</span></label>
                <select className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.direction} onChange={e => handleChange('direction', e.target.value)}>
                  <option value="INCREASE">Increase</option>
                  <option value="DECREASE">Decrease</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Amount <span className="text-red-500">*</span></label>
                <Input type="number" min={0} className="h-9 text-sm" value={formData.amount || ''} onChange={e => handleChange('amount', Number(e.target.value))} />
              </div>
              <div className="lg:col-span-3">
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Description</label>
                <Input className="h-9 text-sm" placeholder="Optional notes about this line" value={formData.description} onChange={e => handleChange('description', e.target.value)} />
              </div>
              <div className="lg:col-span-2">
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Customer Name</label>
                <Input className="h-9 text-sm" placeholder="Optional" value={formData.rawCustomerName} onChange={e => handleChange('rawCustomerName', e.target.value)} />
              </div>
              <div className="lg:col-span-2">
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Customer Phone</label>
                <Input className="h-9 text-sm" placeholder="Optional" value={formData.rawCustomerPhone} onChange={e => handleChange('rawCustomerPhone', e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-200">
              <Button type="button" variant="outline" size="sm" onClick={handleCancelAdd}>
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={handleSaveRow}>
                Save Row
              </Button>
            </div>
          </div>
        ) : (
          <Button type="button" variant="outline" size="sm" onClick={handleStartAdd} className="bg-white">
            <Plus className="w-4 h-4 mr-2" /> Add Row
          </Button>
        )}

        <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={loading || lines.length === 0 || addingRow}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save All Lines
          </Button>
        </div>
      </div>
    </Modal>

    <Modal isOpen={showTutorial} onClose={() => setShowTutorial(false)} title="Tutorial: Cara Menambah Baris" className="max-w-3xl">
      <div className="space-y-6 text-slate-700 text-sm leading-relaxed max-h-[70vh] overflow-y-auto pr-2">
        <div>
          <p className="mb-2">Fitur penambahan baris kini menggunakan metode <strong>Validasi per Baris</strong> agar data lebih akurat dan rapi.</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Klik tombol <span className="font-semibold text-slate-900 border border-slate-200 px-1.5 py-0.5 rounded bg-slate-50">+ Add Row</span> untuk membuka formulir.</li>
            <li>Isi detail transaksi pada formulir yang tersedia.</li>
            <li>Klik tombol <span className="font-semibold text-slate-900 border border-slate-200 px-1.5 py-0.5 rounded bg-slate-50">Save Row</span> untuk memasukkan data ke dalam tabel sementara.</li>
            <li>Jika sudah selesai menambahkan semua baris, klik <span className="font-semibold text-white bg-primary-600 px-1.5 py-0.5 rounded">Save All Lines</span> di bawah tabel untuk menyimpan secara permanen.</li>
          </ol>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <h4 className="font-bold text-slate-900 mb-3 text-base">Penjelasan Kolom Input:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-800 block mb-1">Ext Order ID & Trans ID</span>
              <p className="text-xs text-slate-600">ID Pesanan atau ID Transaksi dari pihak marketplace (misal: ID Pesanan Shopee/Tokopedia).</p>
            </div>
            
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-800 block mb-1">Type (Tipe Transaksi) <span className="text-red-500">*</span></span>
              <p className="text-xs text-slate-600">
                Kategori baris settlement. Contoh:
                <br/>• <strong>ORDER_PROCEEDS:</strong> Pendapatan pesanan
                <br/>• <strong>PLATFORM_FEE / ADMIN_FEE:</strong> Potongan biaya admin
                <br/>• <strong>SHIPPING_CHARGE:</strong> Biaya ongkir
                <br/>• <strong>REFUND / PENALTY:</strong> Pengembalian dana atau denda
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-800 block mb-1">Direction (Arah Dana) <span className="text-red-500">*</span></span>
              <p className="text-xs text-slate-600">
                • <strong>Increase:</strong> Menambah saldo Anda (Pendapatan).
                <br/>• <strong>Decrease:</strong> Mengurangi saldo Anda (Potongan/Biaya).
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-800 block mb-1">Amount (Nominal) <span className="text-red-500">*</span></span>
              <p className="text-xs text-slate-600">Jumlah uang untuk baris ini. Masukkan angka positif saja, arah dana diatur oleh "Direction".</p>
            </div>
          </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
          <p className="text-indigo-800 text-xs">
            <strong>Tips:</strong> Anda dapat menghapus baris yang salah dengan mengklik ikon tempat sampah pada tabel sebelum menyimpannya ke sistem.
          </p>
        </div>
        
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <Button type="button" onClick={() => setShowTutorial(false)}>Mengerti</Button>
        </div>
      </div>
    </Modal>
    </>
  );
}
