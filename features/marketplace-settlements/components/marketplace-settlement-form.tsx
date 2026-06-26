import { useEffect, useState } from "react";
import { useTranslation } from "../../../hooks/use-translation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { AsyncSearchableSelect } from "../../../components/ui/async-searchable-select";
import { businessUnitsApi } from "../../../features/business-units/api";
import { accountsApi } from "../../../features/accounts/api";
import { marketplaceAccountApi } from "../../../features/marketplace-accounts/api";
import { MarketplaceSettlement, CreateMarketplaceSettlementPayload, UpdateMarketplaceSettlementPayload } from "../../../types/marketplace";
import { marketplaceSettlementApi } from "../api";
import { extractErrorMessage } from "../../../lib/error";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Loader2, HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { Modal } from "../../../components/ui/modal";

const formSchema = z.object({
  marketplaceAccountId: z.string().min(1, "Marketplace Account is required"),
  businessUnitId: z.string().min(1, "Business Unit is required"),
  settlementDate: z.string().min(1, "Settlement Date is required"),
  payoutDate: z.string().optional(),
  settlementPeriodStart: z.string().optional(),
  settlementPeriodEnd: z.string().optional(),
  externalSettlementId: z.string().min(1, "External Settlement ID is required"),
  settlementAccountId: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface MarketplaceSettlementFormProps {
  initialData?: MarketplaceSettlement;
}

export function MarketplaceSettlementForm({ initialData }: MarketplaceSettlementFormProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  const formatDate = (dateStr?: string) => dateStr ? dayjs(dateStr).format('YYYY-MM-DD') : "";

  const { register, handleSubmit, control, getValues, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      marketplaceAccountId: initialData?.marketplaceAccountId || "",
      businessUnitId: initialData?.marketplaceAccount?.businessUnitId || "",
      settlementDate: formatDate(initialData?.settlementDate),
      payoutDate: formatDate(initialData?.payoutDate),
      settlementPeriodStart: formatDate(initialData?.settlementPeriodStart),
      settlementPeriodEnd: formatDate(initialData?.settlementPeriodEnd),
      externalSettlementId: initialData?.externalSettlementId || "",
      settlementAccountId: initialData?.settlementAccountId || "",
      notes: initialData?.notes || "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setError(null);
    try {
      if (initialData) {
        await marketplaceSettlementApi.updateMarketplaceSettlement(initialData.id, data as UpdateMarketplaceSettlementPayload);
        router.push(`/dashboard/marketplace-settlements/${initialData.id}`);
      } else {
        const res = await marketplaceSettlementApi.createMarketplaceSettlement(data as CreateMarketplaceSettlementPayload);
        router.push(`/dashboard/marketplace-settlements/${res.data?.id}`);
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const loadMarketplaceAccounts = async (search: string) => {
    const res = await marketplaceAccountApi.getMarketplaceAccounts({ search, limit: 20 });
    return res.data.map((item: any) => ({ value: item.id, label: item.name }));
  };

  const loadBusinessUnits = async (search: string) => {
    const res = await businessUnitsApi.getBusinessUnits({ search, limit: 20 });
    return res.data.map((item: any) => ({ value: item.id, label: item.name }));
  };

  const loadAccounts = async (search: string) => {
    const buId = getValues('businessUnitId');
    const params: any = { search, limit: 20, status: 'ACTIVE' };
    if (buId) params.businessUnitId = buId;
    
    const res = await accountsApi.getAccounts(params);
    return res.data.map((item: any) => ({ 
      value: item.id, 
      label: item.bankName ? `${item.name} - ${item.bankName}${item.accountNumber ? ` (${item.accountNumber})` : ""}` : item.name 
    }));
  };

  return (
    <>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-slate-800">
          {initialData ? 'Edit Settlement' : 'New Settlement'}
        </h3>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={() => setShowTutorial(true)} 
          className="bg-white hover:bg-slate-50 text-indigo-600 border-indigo-200"
        >
          <HelpCircle className="w-4 h-4 mr-2" />
          Cara Pengisian Form
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Marketplace Account <span className="text-red-500">*</span></Label>
          <Controller
            name="marketplaceAccountId"
            control={control}
            render={({ field }) => (
              <AsyncSearchableSelect
                loadOptions={loadMarketplaceAccounts}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                placeholder="Search Account..."
                defaultOptions
              />
            )}
          />
          {errors.marketplaceAccountId && <p className="text-sm text-red-500">{errors.marketplaceAccountId.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="externalSettlementId">External Settlement ID <span className="text-red-500">*</span></Label>
          <Input id="externalSettlementId" placeholder="e.g. SETTLE-001" {...register("externalSettlementId")} />
          {errors.externalSettlementId && <p className="text-sm text-red-500">{errors.externalSettlementId.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Business Unit <span className="text-red-500">*</span></Label>
          <Controller
            name="businessUnitId"
            control={control}
            render={({ field }) => (
              <AsyncSearchableSelect
                loadOptions={loadBusinessUnits}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                placeholder="Search Business Unit..."
                defaultOptions
              />
            )}
          />
          {errors.businessUnitId && <p className="text-sm text-red-500">{errors.businessUnitId.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Bank Account (Optional)</Label>
          <Controller
            name="settlementAccountId"
            control={control}
            render={({ field }) => (
              <AsyncSearchableSelect
                loadOptions={loadAccounts}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                placeholder="Search Account..."
                defaultOptions
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="settlementDate">Settlement Date <span className="text-red-500">*</span></Label>
          <Input id="settlementDate" type="date" {...register("settlementDate")} />
          {errors.settlementDate && <p className="text-sm text-red-500">{errors.settlementDate.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="payoutDate">Payout Date (Optional)</Label>
          <Input id="payoutDate" type="date" {...register("payoutDate")} />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="settlementPeriodStart">Period Start (Optional)</Label>
          <Input id="settlementPeriodStart" type="date" {...register("settlementPeriodStart")} />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="settlementPeriodEnd">Period End (Optional)</Label>
          <Input id="settlementPeriodEnd" type="date" {...register("settlementPeriodEnd")} />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" placeholder="Optional notes" {...register("notes")} />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => initialData ? router.push(`/dashboard/marketplace-settlements/${initialData.id}`) : router.push('/dashboard/marketplace-settlements')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Save Changes' : 'Create Settlement'}
        </Button>
      </div>
    </form>

    <Modal isOpen={showTutorial} onClose={() => setShowTutorial(false)} title="Tutorial: Pengisian Marketplace Settlement" className="max-w-3xl">
      <div className="space-y-6 text-slate-700 text-sm leading-relaxed max-h-[70vh] overflow-y-auto pr-2">
        <p className="mb-2">Form ini digunakan untuk membuat dokumen <strong>Settlement (Pencairan)</strong> dari Marketplace ke dalam sistem.</p>
        
        <h4 className="font-bold text-slate-900 mb-3 text-base">Penjelasan Kolom Input:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="font-semibold text-slate-800 block mb-1">Marketplace Account</span>
            <p className="text-xs text-slate-600">Pilih akun marketplace (misal: Shopee Toko Utama). Pastikan akun sudah didaftarkan.</p>
          </div>
          
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="font-semibold text-slate-800 block mb-1">External Settlement ID</span>
            <p className="text-xs text-slate-600">ID unik yang diberikan oleh pihak Marketplace untuk laporan settlement ini (Reference ID).</p>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="font-semibold text-slate-800 block mb-1">Business Unit & Bank Account</span>
            <p className="text-xs text-slate-600">Unit bisnis yang bertanggung jawab, serta rekening bank tujuan tempat dana dicairkan.</p>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="font-semibold text-slate-800 block mb-1">Settlement & Payout Date</span>
            <p className="text-xs text-slate-600">
              • <strong>Settlement Date:</strong> Tanggal laporan settlement dibuat oleh marketplace.
              <br/>• <strong>Payout Date:</strong> Tanggal dana benar-benar masuk ke rekening bank Anda.
            </p>
          </div>
          
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 md:col-span-2">
            <span className="font-semibold text-slate-800 block mb-1">Period Start & End</span>
            <p className="text-xs text-slate-600">Rentang waktu transaksi yang terangkum di dalam settlement ini. Berguna untuk laporan tutup buku akhir bulan.</p>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100 mt-4">
          <Button type="button" onClick={() => setShowTutorial(false)}>Mengerti</Button>
        </div>
      </div>
    </Modal>
    </>
  );
}
