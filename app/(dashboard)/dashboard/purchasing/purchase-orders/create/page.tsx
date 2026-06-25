"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { purchasingApi } from "../../../../../../features/purchasing/api";
import { useAuthStore } from "../../../../../../store/auth-store";
import { extractErrorMessage } from "../../../../../../lib/error";
import { Button } from "../../../../../../components/ui/button";
import { Input } from "../../../../../../components/ui/input";
import { Label } from "../../../../../../components/ui/label";
import { Alert, AlertDescription } from "../../../../../../components/ui/alert";
import { Textarea } from "../../../../../../components/ui/textarea";
import { SearchableSelect } from "../../../../../../components/ui/searchable-select";
import { PageHeader } from "../../../../../../components/ui/page-header";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useVendors } from "../../../../../../features/purchasing/hooks/use-purchasing";
import { useWarehouses } from "../../../../../../features/warehouses/hooks/use-warehouses";
import { useProductVariants } from "../../../../../../features/products/hooks/use-products";
import { VendorStatus } from "../../../../../../features/purchasing/types";
import { formatInputMoney, unformatMoney } from "../../../../../../features/debts/utils/formatters";

const itemSchema = z.object({
  productVariantId: z.string().min(1, "Product is required"),
  orderedQuantity: z.number().min(1, "Quantity must be at least 1"),
  unitCostStr: z.string().min(1, "Unit cost is required"),
  discountAmountStr: z.string().optional(),
});

const schema = z.object({
  orderDate: z.string().min(1, "Order date is required"),
  vendorId: z.string().min(1, "Vendor is required"),
  warehouseId: z.string().min(1, "Warehouse is required"),
  expectedDeliveryDate: z.string().optional(),
  externalReference: z.string().optional(),
  discountAmountStr: z.string().optional(),
  shippingAmountStr: z.string().optional(),
  otherCostAmountStr: z.string().optional(),
  taxAmountStr: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1, "At least one item is required"),
});

type FormData = z.infer<typeof schema>;

export default function CreatePurchaseOrderPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  
  // Data for selects
  const { data: vendorsData } = useVendors({ limit: 100, vendorStatus: VendorStatus.ACTIVE });
  const vendors = vendorsData || [];
  
  const { data: warehousesData } = useWarehouses({ limit: 100, status: "ACTIVE" });
  const warehouses = warehousesData || [];

  const { data: variantsData } = useProductVariants({ limit: 500, status: "ACTIVE" });
  const variants = variantsData || [];

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      orderDate: new Date().toISOString().split("T")[0],
      vendorId: "",
      warehouseId: "",
      expectedDeliveryDate: "",
      externalReference: "",
      discountAmountStr: "0",
      shippingAmountStr: "0",
      otherCostAmountStr: "0",
      taxAmountStr: "0",
      notes: "",
      items: [
        { productVariantId: "", orderedQuantity: 1, unitCostStr: "0", discountAmountStr: "0" }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const payload = {
        orderDate: new Date(data.orderDate).toISOString(),
        vendorId: data.vendorId,
        warehouseId: data.warehouseId,
        expectedDeliveryDate: data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate).toISOString() : undefined,
        externalReference: data.externalReference || undefined,
        discountAmount: data.discountAmountStr ? unformatMoney(data.discountAmountStr) : undefined,
        shippingAmount: data.shippingAmountStr ? unformatMoney(data.shippingAmountStr) : undefined,
        otherCostAmount: data.otherCostAmountStr ? unformatMoney(data.otherCostAmountStr) : undefined,
        taxAmount: data.taxAmountStr ? unformatMoney(data.taxAmountStr) : undefined,
        notes: data.notes || undefined,
        items: data.items.map(item => ({
          productVariantId: item.productVariantId,
          orderedQuantity: item.orderedQuantity,
          unitCost: unformatMoney(item.unitCostStr),
          discountAmount: item.discountAmountStr ? unformatMoney(item.discountAmountStr) : undefined,
        })),
      };

      const res = await purchasingApi.createPurchaseOrder(payload);
      toast.success("Purchase order created successfully!");
      router.push(`/dashboard/purchasing/purchase-orders/${res.data?.id}`);
    } catch (err) {
      setError(extractErrorMessage(err));
      toast.error("Failed to create purchase order.");
    }
  };

  const handleVariantSelect = (index: number, variantId: string) => {
    setValue(`items.${index}.productVariantId`, variantId);
    const variant = variants.find(v => v.id === variantId);
    if (variant) {
      setValue(`items.${index}.unitCostStr`, formatInputMoney(variant.unitCost || "0"));
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/purchasing/purchase-orders" 
          className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <PageHeader 
          title="Create Purchase Order" 
          description="Create a new draft purchase order for a vendor"
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* SECTION 1: General Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-6">1. General Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Vendor <span className="text-rose-500">*</span></Label>
              <Controller
                control={control}
                name="vendorId"
                render={({ field }) => (
                  <SearchableSelect
                    className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                  >
                    <option value="">-- Select Vendor --</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>{v.vendorCode} - {v.name}</option>
                    ))}
                  </SearchableSelect>
                )}
              />
              {errors.vendorId && <p className="text-sm text-red-500">{errors.vendorId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Target Warehouse <span className="text-rose-500">*</span></Label>
              <Controller
                control={control}
                name="warehouseId"
                render={({ field }) => (
                  <SearchableSelect
                    className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                  >
                    <option value="">-- Select Warehouse --</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>{`${w.warehouseCode} - ${w.name}`}</option>
                    ))}
                  </SearchableSelect>
                )}
              />
              {errors.warehouseId && <p className="text-sm text-red-500">{errors.warehouseId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Order Date <span className="text-rose-500">*</span></Label>
              <Input type="date" {...register("orderDate")} />
              {errors.orderDate && <p className="text-sm text-red-500">{errors.orderDate.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Expected Delivery Date</Label>
              <Input type="date" {...register("expectedDeliveryDate")} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>External Reference / Notes</Label>
              <Input placeholder="e.g. Vendor Quote #1234" {...register("externalReference")} />
            </div>
          </div>
        </div>

        {/* SECTION 2: Items */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800">2. Order Items</h2>
              <p className="text-sm text-slate-500 mt-1">Select products and quantities to order.</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ productVariantId: "", orderedQuantity: 1, unitCostStr: "0", discountAmountStr: "0" })}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Item
            </Button>
          </div>

          {errors.items?.root && (
            <p className="text-sm text-red-500 mb-4">{errors.items.root.message}</p>
          )}

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-4 bg-slate-50 border border-slate-200 rounded-xl relative">
                <div className="absolute -left-3 -top-3 w-6 h-6 bg-slate-800 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                  {index + 1}
                </div>

                <div className="md:col-span-4 space-y-2">
                  <Label className="text-xs">Product Variant <span className="text-rose-500">*</span></Label>
                  <Controller
                    control={control}
                    name={`items.${index}.productVariantId`}
                    render={({ field: selectField }) => (
                      <SearchableSelect
                        className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                        {...selectField}
                        onChange={(e) => handleVariantSelect(index, e.target.value)}
                      >
                        <option value="">-- Select Product --</option>
                        {variants.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.sku} - {v.product?.name} ({v.color} / {v.size})
                          </option>
                        ))}
                      </SearchableSelect>
                    )}
                  />
                  {errors.items?.[index]?.productVariantId && <p className="text-[10px] text-red-500">{errors.items[index]?.productVariantId?.message}</p>}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label className="text-xs">Qty <span className="text-rose-500">*</span></Label>
                  <Input
                    type="number"
                    min="1"
                    className="h-9 text-sm"
                    {...register(`items.${index}.orderedQuantity`, { valueAsNumber: true })}
                  />
                  {errors.items?.[index]?.orderedQuantity && <p className="text-[10px] text-red-500">{errors.items[index]?.orderedQuantity?.message}</p>}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label className="text-xs">Unit Cost <span className="text-rose-500">*</span></Label>
                  <Input
                    className="h-9 text-sm"
                    placeholder="Rp 0"
                    {...register(`items.${index}.unitCostStr`)}
                    onChange={(e) => setValue(`items.${index}.unitCostStr`, formatInputMoney(e.target.value))}
                  />
                  {errors.items?.[index]?.unitCostStr && <p className="text-[10px] text-red-500">{errors.items[index]?.unitCostStr?.message}</p>}
                </div>

                <div className="md:col-span-3 space-y-2">
                  <Label className="text-xs">Discount Amount</Label>
                  <Input
                    className="h-9 text-sm"
                    placeholder="Rp 0"
                    {...register(`items.${index}.discountAmountStr`)}
                    onChange={(e) => setValue(`items.${index}.discountAmountStr`, formatInputMoney(e.target.value))}
                  />
                </div>

                <div className="md:col-span-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full h-9 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: Additional Costs & Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-6">3. Additional Costs & Notes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Total Discount</Label>
                <Input
                  {...register("discountAmountStr")}
                  onChange={(e) => setValue("discountAmountStr", formatInputMoney(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Shipping Cost</Label>
                <Input
                  {...register("shippingAmountStr")}
                  onChange={(e) => setValue("shippingAmountStr", formatInputMoney(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Other Costs</Label>
                <Input
                  {...register("otherCostAmountStr")}
                  onChange={(e) => setValue("otherCostAmountStr", formatInputMoney(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Tax Amount</Label>
                <Input
                  {...register("taxAmountStr")}
                  onChange={(e) => setValue("taxAmountStr", formatInputMoney(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Order Notes / Remarks</Label>
                <Textarea rows={6} placeholder="Any special instructions..." {...register("notes")} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-[140px] shadow-primary-500/30 shadow-md">
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Save Draft PO"}
          </Button>
        </div>
      </form>
    </div>
  );
}
