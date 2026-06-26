import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { customerApi } from "../api";
import { extractErrorMessage } from "../../../lib/error";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Textarea } from "../../../components/ui/textarea";
import { Modal } from "../../../components/ui/modal";
import { AsyncSearchableSelect } from "../../../components/ui/async-searchable-select";
import { Customer } from "../../../types/customer";
import { AlertTriangle } from "lucide-react";

const schema = z.object({
  targetCustomerId: z.string().min(1, { message: "Target customer harus dipilih" }),
  reason: z.string().min(5, { message: "Alasan penggabungan wajib diisi (min 5 karakter)" }),
});

type FormData = z.infer<typeof schema>;

interface CustomerMergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sourceCustomer: Customer;
}

export function CustomerMergeModal({ isOpen, onClose, onSuccess, sourceCustomer }: CustomerMergeModalProps) {
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      targetCustomerId: "",
      reason: "",
    },
  });

  const loadCustomers = async (inputValue: string) => {
    if (!inputValue) return [];
    try {
      const res = await customerApi.getCustomers({ search: inputValue, limit: 10 });
      return res.data
        .filter(c => c.id !== sourceCustomer.id) // exclude self
        .map(c => ({
          value: c.id,
          label: `${c.fullName} (${c.customerCode}) ${c.phone ? `- ${c.phone}` : ''}`,
          customer: c
        }));
    } catch (err) {
      console.error("Failed to load customers", err);
      return [];
    }
  };

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      await customerApi.mergeCustomer(sourceCustomer.id, data);
      onSuccess();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Merge Customer"
      className="max-w-xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl mb-4 text-rose-800 text-sm flex gap-3 items-start">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
          <div>
            <h4 className="font-bold text-rose-900">Peringatan Kritis!</h4>
            <p className="mt-1">
              Operasi ini <strong>TIDAK BISA DIBATALKAN</strong>. 
              Customer <strong>{sourceCustomer.fullName} ({sourceCustomer.customerCode})</strong> akan di-set menjadi INACTIVE / MERGED. 
              Semua order, piutang, dan alamat dari customer ini akan dipindahkan ke Target Customer yang Anda pilih.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetCustomerId">Pilih Target Customer <span className="text-red-500">*</span></Label>
          <Controller
            control={control}
            name="targetCustomerId"
            render={({ field }) => (
              <AsyncSearchableSelect
                {...field}
                loadOptions={loadCustomers}
                placeholder="Ketik nama atau kode customer tujuan..."
                onChange={(e) => field.onChange(e.target.value)}
              />
            )}
          />
          {errors.targetCustomerId && <p className="text-sm text-red-500">{errors.targetCustomerId.message}</p>}
          <p className="text-xs text-slate-500">Customer yang dipilih akan menjadi customer utama yang menerima semua data dari customer sumber.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">Alasan Merge <span className="text-red-500">*</span></Label>
          <Textarea id="reason" placeholder="Contoh: Customer duplikat dengan akun yang lama" {...register("reason")} className="min-h-[80px]" />
          {errors.reason && <p className="text-sm text-red-500">{errors.reason.message}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="destructive" disabled={isSubmitting}>
            {isSubmitting ? "Memproses Merge..." : "Ya, Merge Customer"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
