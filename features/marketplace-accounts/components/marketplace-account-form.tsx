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
import { categoriesApi } from "../../../features/categories/api";
import { MarketplaceAccount, CreateMarketplaceAccountPayload, UpdateMarketplaceAccountPayload, MarketplaceType } from "../../../types/marketplace";
import { marketplaceAccountApi } from "../api";
import { extractErrorMessage } from "../../../lib/error";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Loader2, HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Modal } from "../../../components/ui/modal";

const MARKETPLACE_TYPES = [
  { value: "SHOPEE", label: "Shopee" },
  { value: "TOKOPEDIA", label: "Tokopedia" },
  { value: "TIKTOK_SHOP", label: "TikTok Shop" },
  { value: "LAZADA", label: "Lazada" },
  { value: "BLIBLI", label: "Blibli" },
  { value: "OTHER", label: "Other" },
];

const formSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  marketplaceType: z.enum(["SHOPEE", "TOKOPEDIA", "TIKTOK_SHOP", "LAZADA", "BLIBLI", "OTHER"]),
  sellerAccountId: z.string().optional(),
  businessUnitId: z.string().min(1, "Business Unit is required"),
  settlementAccountId: z.string().optional(),
  settlementClearingCategoryId: z.string().optional(),
  defaultFeeCategoryId: z.string().optional(),
  defaultRefundCategoryId: z.string().optional(),
  defaultPenaltyCategoryId: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface MarketplaceAccountFormProps {
  initialData?: MarketplaceAccount;
}

export function MarketplaceAccountForm({ initialData }: MarketplaceAccountFormProps) {
  const [showTutorial, setShowTutorial] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, control, getValues, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: initialData?.code || "",
      name: initialData?.name || "",
      marketplaceType: initialData?.marketplaceType || "SHOPEE",
      sellerAccountId: initialData?.sellerAccountId || "",
      businessUnitId: (initialData as any)?.businessUnit?.id || initialData?.businessUnitId || "",
      settlementAccountId: (initialData as any)?.settlementAccount?.id || initialData?.settlementAccountId || "",
      settlementClearingCategoryId: (initialData as any)?.settlementClearingCategory?.id || initialData?.settlementClearingCategoryId || "",
      defaultFeeCategoryId: (initialData as any)?.defaultFeeCategory?.id || initialData?.defaultFeeCategoryId || "",
      defaultRefundCategoryId: (initialData as any)?.defaultRefundCategory?.id || initialData?.defaultRefundCategoryId || "",
      defaultPenaltyCategoryId: (initialData as any)?.defaultPenaltyCategory?.id || initialData?.defaultPenaltyCategoryId || "",
      notes: initialData?.notes || "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setError(null);
    try {
      if (initialData) {
        const { code, ...updatePayload } = data;
        await marketplaceAccountApi.updateMarketplaceAccount(initialData.id, updatePayload as UpdateMarketplaceAccountPayload);
      } else {
        await marketplaceAccountApi.createMarketplaceAccount(data as CreateMarketplaceAccountPayload);
      }
      router.push("/dashboard/marketplace-accounts");
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const loadBusinessUnits = async (search: string) => {
    const res = await businessUnitsApi.getBusinessUnits({ search, limit: 20 });
    return res.data.map((item) => ({ value: item.id, label: item.name }));
  };

  const loadAccounts = async (search: string) => {
    const buId = getValues("businessUnitId");
    const params: any = { search, limit: 100, status: 'ACTIVE', sortBy: 'name', sortOrder: 'asc' };
    if (buId) params.businessUnitId = buId;

    try {
      const res = await accountsApi.getAccounts(params);
      const accounts = Array.isArray(res.data) ? res.data : [];
      return accounts.map((item: any) => ({
        value: item.id,
        label: item.bankName
          ? `${item.name} - ${item.bankName}${item.accountNumber ? ` (${item.accountNumber})` : ""}`
          : item.name
      }));
    } catch {
      return [];
    }
  };

  const loadInCategories = async (search: string) => {
    try {
      const res = await categoriesApi.getCategories({ search, limit: 100, status: 'ACTIVE', type: 'IN', sortBy: 'name', sortOrder: 'asc' });
      const categories = Array.isArray(res.data) ? res.data : [];
      return categories.map((item: any) => ({
        value: item.id,
        label: item.parent?.name ? `${item.parent.name} / ${item.name}` : item.name
      }));
    } catch {
      return [];
    }
  };

  const loadOutCategories = async (search: string) => {
    try {
      const res = await categoriesApi.getCategories({ search, limit: 100, status: 'ACTIVE', type: 'OUT', sortBy: 'name', sortOrder: 'asc' });
      const categories = Array.isArray(res.data) ? res.data : [];
      return categories.map((item: any) => ({
        value: item.id,
        label: item.parent?.name ? `${item.parent.name} / ${item.name}` : item.name
      }));
    } catch {
      return [];
    }
  };

  return (
    <>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-slate-800">
          {initialData ? 'Edit Marketplace Account' : 'New Marketplace Account'}
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
          <Label htmlFor="code">Account Code <span className="text-red-500">*</span></Label>
          <Input id="code" placeholder="e.g. SP-JKT-01" {...register("code")} />
          {errors.code && <p className="text-sm text-red-500">{errors.code.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Account Name <span className="text-red-500">*</span></Label>
          <Input id="name" placeholder="e.g. Shopee Jakarta" {...register("name")} />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Marketplace Type <span className="text-red-500">*</span></Label>
          <Controller
            name="marketplaceType"
            control={control}
            render={({ field }) => (
              <select 
                {...field}
                className="w-full flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {MARKETPLACE_TYPES.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            )}
          />
          {errors.marketplaceType && <p className="text-sm text-red-500">{errors.marketplaceType.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sellerAccountId">Seller Account ID</Label>
          <Input id="sellerAccountId" placeholder="e.g. shoppe_seller_id" {...register("sellerAccountId")} />
          <p className="text-xs text-slate-500">External ID used for matching.</p>
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
                defaultOptions={(initialData as any)?.businessUnit ? [{ value: (initialData as any).businessUnit.id, label: (initialData as any).businessUnit.name }] : true}
              />
            )}
          />
          {errors.businessUnitId && <p className="text-sm text-red-500">{errors.businessUnitId.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Label>Settlement Account</Label>
          <Controller
            name="settlementAccountId"
            control={control}
            render={({ field }) => (
              <AsyncSearchableSelect
                loadOptions={loadAccounts}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                placeholder="Search Account..."
                defaultOptions={(initialData as any)?.settlementAccount ? [{ 
                  value: (initialData as any).settlementAccount.id, 
                  label: (initialData as any).settlementAccount.bankName ? `${(initialData as any).settlementAccount.name} - ${(initialData as any).settlementAccount.bankName}${(initialData as any).settlementAccount.accountNumber ? ` (${(initialData as any).settlementAccount.accountNumber})` : ""}` : (initialData as any).settlementAccount.name
                }] : true}
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label>Settlement Clearing Category</Label>
          <Controller
            name="settlementClearingCategoryId"
            control={control}
            render={({ field }) => (
              <AsyncSearchableSelect
                loadOptions={loadInCategories}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                placeholder="Search Category..."
                defaultOptions={(initialData as any)?.settlementClearingCategory ? [{ value: (initialData as any).settlementClearingCategory.id, label: (initialData as any).settlementClearingCategory.name }] : true}
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label>Default Fee Category</Label>
          <Controller
            name="defaultFeeCategoryId"
            control={control}
            render={({ field }) => (
              <AsyncSearchableSelect
                loadOptions={loadOutCategories}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                placeholder="Search Category..."
                defaultOptions={(initialData as any)?.defaultFeeCategory ? [{ value: (initialData as any).defaultFeeCategory.id, label: (initialData as any).defaultFeeCategory.name }] : true}
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label>Default Refund Category</Label>
          <Controller
            name="defaultRefundCategoryId"
            control={control}
            render={({ field }) => (
              <AsyncSearchableSelect
                loadOptions={loadOutCategories}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                placeholder="Search Category..."
                defaultOptions={(initialData as any)?.defaultRefundCategory ? [{ value: (initialData as any).defaultRefundCategory.id, label: (initialData as any).defaultRefundCategory.name }] : true}
              />
            )}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Default Penalty Category</Label>
          <Controller
            name="defaultPenaltyCategoryId"
            control={control}
            render={({ field }) => (
              <AsyncSearchableSelect
                loadOptions={loadOutCategories}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                placeholder="Search Category..."
                defaultOptions={(initialData as any)?.defaultPenaltyCategory ? [{ value: (initialData as any).defaultPenaltyCategory.id, label: (initialData as any).defaultPenaltyCategory.name }] : true}
              />
            )}
          />
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
          onClick={() => router.push('/dashboard/marketplace-accounts')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Save Changes' : 'Create Account'}
        </Button>
      </div>
    </form>

    <Modal isOpen={showTutorial} onClose={() => setShowTutorial(false)} title="Tutorial: Marketplace Account" className="max-w-4xl">
      <div className="space-y-6 text-slate-700 text-sm leading-relaxed max-h-[70vh] overflow-y-auto pr-2">
        <p className="mb-2">Formulir ini digunakan untuk mendaftarkan akun Marketplace perusahaan (misal: Toko Shopee Utama, Toko Tokopedia Cabang 1) agar dapat dihubungkan dengan proses settlement dan pembukuan.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold text-slate-900 mb-3 text-base">Informasi Umum:</h4>
            <div className="space-y-3">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-800 block mb-1">Code & Name</span>
                <p className="text-xs text-slate-600">Kode unik dan nama akun toko Anda (misal Code: `SHP-01`, Name: `Shopee Toko Utama`).</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-800 block mb-1">Marketplace Type</span>
                <p className="text-xs text-slate-600">Pilih jenis platform (Shopee, Tokopedia, dll). Penting untuk integrasi spesifik per platform ke depannya.</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-800 block mb-1">Seller Account ID</span>
                <p className="text-xs text-slate-600">ID toko/seller Anda yang tercatat di sistem marketplace (opsional, berguna untuk pencocokan data API).</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-800 block mb-1">Business Unit</span>
                <p className="text-xs text-slate-600">Unit bisnis/cabang perusahaan yang memiliki dan mengelola akun toko ini.</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-3 text-base">Konfigurasi Settlement (Akuntansi):</h4>
            <div className="space-y-3">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-800 block mb-1">Settlement Account</span>
                <p className="text-xs text-slate-600">Rekening bank utama perusahaan tempat pihak marketplace mentransfer (mencairkan) dana hasil penjualan akun ini.</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-800 block mb-1">Clearing Category</span>
                <p className="text-xs text-slate-600">Kategori akun "penampung sementara" (Piutang Marketplace) sebelum dana dicairkan ke rekening bank.</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-800 block mb-1">Default Fee Category</span>
                <p className="text-xs text-slate-600">Kategori beban (expense) untuk mencatat potongan biaya admin/layanan otomatis.</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-800 block mb-1">Refund & Penalty Category</span>
                <p className="text-xs text-slate-600">Kategori untuk menampung pengembalian dana (refund) dan denda (penalty) dari platform.</p>
              </div>
            </div>
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
