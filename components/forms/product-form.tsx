import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { productsApi } from "../../features/products/api";
import { extractErrorMessage } from "../../lib/error";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { Product } from "../../types/product";
import { ProductType } from "../../types/enums";
import { BusinessUnit } from "../../types/business-unit";
import { SearchableSelect } from "@/components/ui/searchable-select";

const formatInputMoney = (val: string) => {
  const numeric = val.replace(/\D/g, "");
  return numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const unformatMoney = (val: string) => {
  return parseInt(val.replace(/\./g, ""), 10) || 0;
};

const schema = z.object({
  businessUnitId: z.string().optional(),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  type: z.nativeEnum(ProductType),
  sku: z.string().optional(),
  defaultHppStr: z.string().min(1, "Wajib diisi"),
  defaultPriceStr: z.string().min(1, "Wajib diisi"),
  description: z.string().optional(),
}).refine((data) => unformatMoney(data.defaultPriceStr) >= unformatMoney(data.defaultHppStr), {
  message: "Default price must be greater than or equal to HPP",
  path: ["defaultPriceStr"],
});

type FormData = z.infer<typeof schema>;

interface ProductFormProps {
  initialData?: Product;
  businessUnits: BusinessUnit[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductForm({ initialData, businessUnits, onSuccess, onCancel }: ProductFormProps) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      businessUnitId: initialData?.businessUnitId || "",
      name: initialData?.name || "",
      type: initialData?.type || ProductType.PHYSICAL_PRODUCT,
      sku: initialData?.sku || "",
      defaultHppStr: initialData ? formatInputMoney(initialData.defaultHpp) : "0",
      defaultPriceStr: initialData ? formatInputMoney(initialData.defaultPrice) : "0",
      description: initialData?.description || "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const payload = {
        name: data.name,
        type: data.type,
        defaultHpp: unformatMoney(data.defaultHppStr),
        defaultPrice: unformatMoney(data.defaultPriceStr),
        businessUnitId: data.businessUnitId || undefined,
        sku: data.sku || undefined,
        description: data.description || undefined,
      };

      if (initialData) {
        await productsApi.updateProduct(initialData.id, payload);
      } else {
        await productsApi.createProduct(payload);
      }
      onSuccess();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name</Label>
          <Input id="name" placeholder="e.g. T-Shirt Guntai" {...register("name")} />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Product Type</Label>
          <SearchableSelect
            id="type"
            className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            {...register("type")}
          >
            {Object.values(ProductType).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </SearchableSelect>
          {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sku">SKU (Optional)</Label>
          <Input id="sku" placeholder="e.g. TSHIRT-001" {...register("sku")} />
          {errors.sku && <p className="text-sm text-red-500">{errors.sku.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessUnitId">Business Unit (Optional)</Label>
          <SearchableSelect
            id="businessUnitId"
            className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            {...register("businessUnitId")}
          >
            <option value="">-- No Business Unit --</option>
            {businessUnits.map((bu) => (
              <option key={bu.id} value={bu.id}>{bu.name}</option>
            ))}
          </SearchableSelect>
          {errors.businessUnitId && <p className="text-sm text-red-500">{errors.businessUnitId.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="defaultHppStr">Default HPP</Label>
          <Controller
            name="defaultHppStr"
            control={control}
            render={({ field }) => (
              <Input 
                id="defaultHppStr"
                type="text" 
                inputMode="numeric"
                value={field.value}
                onChange={(e) => field.onChange(formatInputMoney(e.target.value))}
              />
            )}
          />
          {errors.defaultHppStr && <p className="text-sm text-red-500">{errors.defaultHppStr.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="defaultPriceStr">Default Price</Label>
          <Controller
            name="defaultPriceStr"
            control={control}
            render={({ field }) => (
              <Input 
                id="defaultPriceStr"
                type="text" 
                inputMode="numeric"
                value={field.value}
                onChange={(e) => field.onChange(formatInputMoney(e.target.value))}
              />
            )}
          />
          {errors.defaultPriceStr && <p className="text-sm text-red-500">{errors.defaultPriceStr.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Input id="description" placeholder="Product details" {...register("description")} />
        {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : initialData ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
