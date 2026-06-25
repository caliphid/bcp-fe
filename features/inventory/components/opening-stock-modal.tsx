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
import { PlusCircle, Trash2 } from "lucide-react";

const itemSchema = z.object({
  productVariantId: z.string().min(1, "Variant is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

const schema = z.object({
  warehouseId: z.string().min(1, "Warehouse is required"),
  movementDate: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1, "At least one item is required"),
});

type FormData = z.infer<typeof schema>;

interface OpeningStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  warehouses: Warehouse[];
  variants: ProductVariant[];
}

export function OpeningStockModal({ isOpen, onClose, onSuccess, warehouses, variants }: OpeningStockModalProps) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      warehouseId: "",
      movementDate: new Date().toISOString().split("T")[0],
      notes: "",
      items: [{ productVariantId: "", quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      await inventoryApi.createOpeningStock({
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Input Opening Stock"
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
            <Label htmlFor="warehouseId">Warehouse <span className="text-red-500">*</span></Label>
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
                  <option value="">-- Select Warehouse --</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </SearchableSelect>
              )}
            />
            {errors.warehouseId && <p className="text-sm text-red-500">{errors.warehouseId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="movementDate">Date <span className="text-red-500">*</span></Label>
            <Input type="date" id="movementDate" {...register("movementDate")} />
            {errors.movementDate && <p className="text-sm text-red-500">{errors.movementDate.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Input id="notes" placeholder="e.g. Initial stock input for new warehouse" {...register("notes")} />
        </div>

        <div className="mt-6 border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
            <h4 className="font-semibold text-slate-800">Items</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ productVariantId: "", quantity: 1 })}
              className="h-8"
            >
              <PlusCircle className="w-4 h-4 mr-2" /> Add Item
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
                        placeholder="Search Product Variant..."
                        loadOptions={loadVariantOptions}
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
                    placeholder="Qty"
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

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Opening Stock"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
