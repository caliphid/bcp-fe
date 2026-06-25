import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { productApi } from "../api";
import { extractErrorMessage } from "../../../lib/error";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Modal } from "../../../components/ui/modal";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { ProductVariant } from "../../../types/product";

const formatInputMoney = (val: string) => {
  const numeric = val.replace(/\D/g, "");
  return numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const unformatMoney = (val: string) => {
  return parseInt(val.replace(/\./g, ""), 10) || 0;
};

const schema = z.object({
  sku: z.string().min(1, "SKU is required"),
  color: z.string().min(1, "Color is required"),
  size: z.string().min(1, "Size is required"),
  unitCostStr: z.string().min(1, "Wajib diisi"),
  sellingPriceStr: z.string().optional(),
  barcode: z.string().optional(),
  minimumStock: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface VariantFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productId: string;
  initialData?: ProductVariant | null;
}

export function VariantFormModal({ isOpen, onClose, onSuccess, productId, initialData }: VariantFormModalProps) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      sku: "",
      color: "",
      size: "",
      unitCostStr: "0",
      sellingPriceStr: "0",
      barcode: "",
      minimumStock: "0",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          sku: initialData.sku,
          color: initialData.color,
          size: initialData.size,
          unitCostStr: formatInputMoney(initialData.unitCost),
          sellingPriceStr: initialData.sellingPrice ? formatInputMoney(initialData.sellingPrice) : "0",
          barcode: initialData.barcode || "",
          minimumStock: initialData.minimumStock?.toString() || "0",
        });
      } else {
        reset({
          sku: "",
          color: "",
          size: "",
          unitCostStr: "0",
          sellingPriceStr: "0",
          barcode: "",
          minimumStock: "0",
        });
      }
    }
  }, [isOpen, initialData, reset]);

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const payload = {
        productId,
        sku: data.sku,
        color: data.color,
        size: data.size,
        unitCost: unformatMoney(data.unitCostStr).toString(),
        sellingPrice: unformatMoney(data.sellingPriceStr || "0").toString(),
        barcode: data.barcode || undefined,
        minimumStock: parseInt(data.minimumStock || "0", 10),
      };

      if (initialData) {
        await productApi.updateProductVariant(initialData.id, payload);
      } else {
        await productApi.createProductVariant(payload);
      }
      onSuccess();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Variant" : "Create Variant"}
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sku">SKU <span className="text-red-500">*</span></Label>
            <Input id="sku" placeholder="e.g. TSHIRT-001-M-WHT" {...register("sku")} />
            {errors.sku && <p className="text-sm text-red-500">{errors.sku.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="barcode">Barcode (Optional)</Label>
            <Input id="barcode" placeholder="e.g. 8991234567890" {...register("barcode")} />
            {errors.barcode && <p className="text-sm text-red-500">{errors.barcode.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="color">Color <span className="text-red-500">*</span></Label>
            <Input id="color" placeholder="e.g. White" {...register("color")} />
            {errors.color && <p className="text-sm text-red-500">{errors.color.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="size">Size <span className="text-red-500">*</span></Label>
            <Input id="size" placeholder="e.g. M" {...register("size")} />
            {errors.size && <p className="text-sm text-red-500">{errors.size.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="unitCostStr">Unit Cost (HPP) <span className="text-red-500">*</span></Label>
            <Controller
              name="unitCostStr"
              control={control}
              render={({ field }) => (
                <Input 
                  id="unitCostStr"
                  type="text" 
                  inputMode="numeric"
                  value={field.value}
                  onChange={(e) => field.onChange(formatInputMoney(e.target.value))}
                />
              )}
            />
            {errors.unitCostStr && <p className="text-sm text-red-500">{errors.unitCostStr.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sellingPriceStr">Selling Price <span className="text-red-500">*</span></Label>
            <Controller
              name="sellingPriceStr"
              control={control}
              render={({ field }) => (
                <Input 
                  id="sellingPriceStr"
                  type="text" 
                  inputMode="numeric"
                  value={field.value}
                  onChange={(e) => field.onChange(formatInputMoney(e.target.value))}
                />
              )}
            />
            {errors.sellingPriceStr && <p className="text-sm text-red-500">{errors.sellingPriceStr.message}</p>}
          </div>
        </div>

        <div className="space-y-2 w-1/2 pr-2">
          <Label htmlFor="minimumStock">Minimum Stock Alert</Label>
          <Input id="minimumStock" type="number" min="0" {...register("minimumStock")} />
          {errors.minimumStock && <p className="text-sm text-red-500">{errors.minimumStock.message}</p>}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : initialData ? "Update Variant" : "Create Variant"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
