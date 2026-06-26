import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { inventoryApi } from "../api";
import { extractErrorMessage } from "../../../lib/error";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Modal } from "../../../components/ui/modal";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { AsyncSearchableSelect } from "@/components/ui/async-searchable-select";
import { Warehouse } from "../../../types/warehouse";
import { productApi } from "@/features/products/api";
import { ProductVariant } from "../../../types/product";
import { PlusCircle, Trash2, HelpCircle } from "lucide-react";
import { useTranslation } from "../../../hooks/use-translation";

const itemSchema = z.object({
  productVariantId: z.string().min(1, "Variant is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

const schema = z.object({
  warehouseId: z.string().min(1, "Warehouse is required"),
  movementDate: z.string().min(1, "Date is required"),
  type: z.enum(["STOCK_ADJUSTMENT_IN", "STOCK_ADJUSTMENT_OUT", "DAMAGED"]),
  reason: z.string().min(1, "Reason is required"),
  items: z.array(itemSchema).min(1, "At least one item is required"),
});

type FormData = z.infer<typeof schema>;

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  warehouses: Warehouse[];
  variants: ProductVariant[];
  initialWarehouseId?: string;
  initialVariantId?: string;
  initialVariantLabel?: string;
}

export function StockAdjustmentModal({
  isOpen,
  onClose,
  onSuccess,
  warehouses,
  variants,
  initialWarehouseId,
  initialVariantId,
  initialVariantLabel
}: StockAdjustmentModalProps) {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      warehouseId: initialWarehouseId || "",
      movementDate: new Date().toISOString().split("T")[0],
      type: "STOCK_ADJUSTMENT_IN",
      reason: "",
      items: [{ productVariantId: initialVariantId || "", quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      await inventoryApi.createStockAdjustment({
        ...data,
        movementDate: new Date(data.movementDate).toISOString(),
      });
      onSuccess();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const loadVariantOptions = async (inputValue: string) => {
    try {
      const res = await productApi.getProductVariants({ limit: 50, status: "ACTIVE", search: inputValue });
      return res.data.map(v => ({
        value: v.id,
        label: `${v.product?.name} - ${v.color} - ${v.size} (${v.sku})`
      }));
    } catch {
      return [];
    }
  };

  return (
    <>
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("features.inventory.stockAdjustment.title")}
      className="max-w-3xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="warehouseId">{t("common.labels.warehouse")} <span className="text-red-500">*</span></Label>
            <Controller
              control={control}
              name="warehouseId"
              render={({ field }) => (
                <SearchableSelect
                  id="warehouseId"
                  className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  {...field}
                  onChange={(e: any) => field.onChange(e?.target?.value ?? e)}
                >
                  <option value="">{t("features.inventory.stockAdjustment.selectWarehouse")}</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </SearchableSelect>
              )}
            />
            {errors.warehouseId && <p className="text-sm text-red-500">{errors.warehouseId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="movementDate">{t("common.labels.date")} <span className="text-red-500">*</span></Label>
            <Input type="date" id="movementDate" {...register("movementDate")} />
            {errors.movementDate && <p className="text-sm text-red-500">{errors.movementDate.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">{t("features.inventory.stockAdjustment.adjType")} <span className="text-red-500">*</span></Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <SearchableSelect
                  id="type"
                  className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  {...field}
                  onChange={(e: any) => field.onChange(e?.target?.value ?? e)}
                >
                  <option value="STOCK_ADJUSTMENT_IN">{t("features.inventory.stockAdjustment.adjIn")}</option>
                  <option value="STOCK_ADJUSTMENT_OUT">{t("features.inventory.stockAdjustment.adjOut")}</option>
                  <option value="DAMAGED">{t("features.inventory.stockAdjustment.damaged")}</option>
                </SearchableSelect>
              )}
            />
            {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">{t("features.inventory.stockAdjustment.reason")} <span className="text-red-500">*</span></Label>
            <Input id="reason" placeholder={t("features.inventory.stockAdjustment.reasonPh")} {...register("reason")} />
            {errors.reason && <p className="text-sm text-red-500">{errors.reason.message}</p>}
          </div>
        </div>

        <div className="mt-6 border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
            <h4 className="font-semibold text-slate-800">{t("common.labels.items")}</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ productVariantId: "", quantity: 1 })}
              className="h-8"
            >
              <PlusCircle className="w-4 h-4 mr-2" /> {t("features.inventory.stockAdjustment.addItem")}
            </Button>
          </div>
          
          <div className="p-4 space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-4 items-start">
                <div className="flex-1 space-y-1">
                  <Controller
                    control={control}
                    name={`items.${index}.productVariantId`}
                    render={({ field }) => (
                      <AsyncSearchableSelect
                        {...field}
                        className="flex w-full"
                        placeholder={t("features.inventory.stockAdjustment.searchVariant")}
                        loadOptions={loadVariantOptions}
                        defaultOptions={
                          initialVariantId && initialVariantLabel && index === 0
                            ? [{ value: initialVariantId, label: initialVariantLabel }]
                            : true
                        }
                        onChange={(e: any) => field.onChange(e?.target?.value ?? e)}
                      />
                    )}
                  />
                  {errors.items?.[index]?.productVariantId && (
                    <p className="text-xs text-red-500">{errors.items[index]?.productVariantId?.message}</p>
                  )}
                </div>
                <div className="w-32 space-y-1">
                  <Input 
                    type="number" 
                    min="1" 
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })} 
                    placeholder={t("common.labels.qty")}
                  />
                  {errors.items?.[index]?.quantity && (
                    <p className="text-xs text-red-500">{errors.items[index]?.quantity?.message}</p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {errors.items && !Array.isArray(errors.items) && (
              <p className="text-sm text-red-500">{errors.items.message}</p>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowTutorial(true)} className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2 h-8">
            <HelpCircle className="w-4 h-4 mr-1.5" /> Panduan Fitur
          </Button>
          <div className="flex space-x-3">
            <Button type="button" variant="ghost" onClick={onClose}>
              {t("common.actions.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("common.actions.submitting") : t("features.inventory.stockAdjustment.submitBtn")}
            </Button>
          </div>
        </div>
      </form>
    </Modal>

    <Modal isOpen={showTutorial} onClose={() => setShowTutorial(false)} title="Tutorial: Penyesuaian Stok (Stock Adjustment)" className="max-w-2xl">
      <div className="space-y-6 text-slate-700 text-sm leading-relaxed max-h-[70vh] overflow-y-auto pr-2">
        <p className="mb-2">Fitur <strong>Stock Adjustment</strong> ini digunakan saat terjadi selisih stok (stok fisik tidak sama dengan stok di sistem). Setiap perubahan stok di sini akan tercatat abadi di <strong>Log Pergerakan</strong> (Inventory Movements).</p>
        
        <h4 className="font-bold text-slate-900 mb-3 text-base">Tipe Penyesuaian:</h4>
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
            <span className="font-semibold text-emerald-800 block mb-1">Stock Adjustment IN (Stok Bertambah)</span>
            <p className="text-xs text-emerald-700">Pilih ini jika fisik barang ternyata lebih banyak daripada di sistem (kelebihan). Nilai HPP stok akan bertambah.</p>
          </div>
          
          <div className="bg-rose-50 p-3 rounded-lg border border-rose-100">
            <span className="font-semibold text-rose-800 block mb-1">Stock Adjustment OUT / DAMAGED (Stok Berkurang)</span>
            <p className="text-xs text-rose-700">Pilih ini jika fisik barang lebih sedikit (kehilangan) atau ada barang yang rusak (Damaged). Aksi ini akan mencatat jurnal pemotongan persediaan dan membebankan biaya kerugian (Loss) pada laba/rugi perusahaan.</p>
          </div>
        </div>

        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 mt-4">
          <span className="font-semibold text-amber-800 block mb-1">Penting: Penjelasan (Reason)</span>
          <p className="text-xs text-amber-700">Anda wajib mengisi kolom <strong>Reason</strong>. Jelaskan dengan detail alasan penyesuaian stok (Misalnya: "Stok opname akhir bulan", atau "Barang digigit tikus"). Ini penting untuk proses Audit Keuangan kelak.</p>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100 mt-4">
          <Button type="button" onClick={() => setShowTutorial(false)}>Mengerti</Button>
        </div>
      </div>
    </Modal>
    </>
  );
}
