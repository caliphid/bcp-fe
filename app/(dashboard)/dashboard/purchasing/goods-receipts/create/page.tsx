"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { purchasingApi } from "../../../../../../features/purchasing/api";
import { usePurchaseOrder } from "../../../../../../features/purchasing/hooks/use-purchasing";
import { useAuthStore } from "../../../../../../store/auth-store";
import { extractErrorMessage } from "../../../../../../lib/error";
import { Button } from "../../../../../../components/ui/button";
import { Input } from "../../../../../../components/ui/input";
import { Label } from "../../../../../../components/ui/label";
import { Alert, AlertDescription } from "../../../../../../components/ui/alert";
import { Textarea } from "../../../../../../components/ui/textarea";
import { PageHeader } from "../../../../../../components/ui/page-header";
import { ArrowLeft, Loader2, Info } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const itemSchema = z.object({
  purchaseOrderItemId: z.string(),
  productName: z.string(),
  sku: z.string(),
  outstandingQuantity: z.number(),
  receivedQuantity: z.number().min(0, "Must be positive"),
  acceptedQuantity: z.number().min(0, "Must be positive"),
  rejectedQuantity: z.number().min(0, "Must be positive"),
}).refine(data => data.acceptedQuantity + data.rejectedQuantity === data.receivedQuantity, {
  message: "Accepted + Rejected must equal Received",
  path: ["rejectedQuantity"],
}).refine(data => data.acceptedQuantity <= data.outstandingQuantity, {
  message: "Accepted cannot exceed outstanding quantity",
  path: ["acceptedQuantity"],
});

const schema = z.object({
  receiptDate: z.string().min(1, "Receipt date is required"),
  vendorDeliveryNumber: z.string().optional(),
  createDebt: z.boolean(),
  vendorInvoiceNumber: z.string().optional(),
  paymentDueDate: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1, "At least one item is required"),
}).refine(data => {
  if (data.createDebt && !data.vendorInvoiceNumber) return false;
  return true;
}, {
  message: "Invoice number is required when Create Debt is checked",
  path: ["vendorInvoiceNumber"],
}).refine(data => {
  if (data.createDebt && !data.paymentDueDate) return false;
  return true;
}, {
  message: "Payment due date is required when Create Debt is checked",
  path: ["paymentDueDate"],
}).refine(data => {
  return data.items.some(item => item.receivedQuantity > 0);
}, {
  message: "At least one item must have a received quantity > 0",
  path: ["items"],
});

type FormData = z.infer<typeof schema>;

function CreateGoodsReceiptContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const purchaseOrderId = searchParams.get("purchaseOrderId");
  const [error, setError] = useState<string | null>(null);

  const { data: po, isLoading: isPOLoading } = usePurchaseOrder(purchaseOrderId || undefined);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      receiptDate: new Date().toISOString().split("T")[0],
      vendorDeliveryNumber: "",
      createDebt: false,
      vendorInvoiceNumber: "",
      paymentDueDate: "",
      notes: "",
      items: [],
    },
  });

  const { fields } = useFieldArray({
    control,
    name: "items",
  });

  const createDebt = watch("createDebt");

  useEffect(() => {
    if (po && po.items) {
      const items = po.items
        .map(item => {
          const outstanding = item.outstandingQuantity ?? (item.orderedQuantity - (item.receivedQuantity || 0) - (item.cancelledQuantity || 0));
          return { ...item, _outstanding: outstanding };
        })
        .filter(item => item._outstanding > 0)
        .map(item => ({
          purchaseOrderItemId: item.id,
          productName: item.productVariant?.product?.name || "Unknown",
          sku: item.productVariant?.sku || "-",
          outstandingQuantity: item._outstanding,
          receivedQuantity: 0,
          acceptedQuantity: 0,
          rejectedQuantity: 0,
        }));
      setValue("items", items);
    }
  }, [po, setValue]);

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const itemsToSubmit = data.items
        .filter(i => i.receivedQuantity > 0)
        .map(i => ({
          purchaseOrderItemId: i.purchaseOrderItemId,
          receivedQuantity: i.receivedQuantity,
          acceptedQuantity: i.acceptedQuantity,
          rejectedQuantity: i.rejectedQuantity > 0 ? i.rejectedQuantity : undefined,
        }));

      const payload = {
        purchaseOrderId: purchaseOrderId!,
        receiptDate: new Date(data.receiptDate).toISOString(),
        vendorDeliveryNumber: data.vendorDeliveryNumber || undefined,
        createDebt: data.createDebt,
        vendorInvoiceNumber: data.createDebt ? data.vendorInvoiceNumber : undefined,
        paymentDueDate: data.createDebt ? new Date(data.paymentDueDate!).toISOString() : undefined,
        notes: data.notes || undefined,
        items: itemsToSubmit,
      };

      const res = await purchasingApi.createGoodsReceipt(payload);
      toast.success("Goods receipt created successfully!");
      router.push(`/dashboard/purchasing/goods-receipts/${res.data?.id}`);
    } catch (err) {
      setError(extractErrorMessage(err));
      toast.error("Failed to create goods receipt.");
    }
  };

  if (!purchaseOrderId) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500 mb-4">No Purchase Order ID provided.</p>
        <Link href="/dashboard/purchasing/purchase-orders">
          <Button>Go to Purchase Orders</Button>
        </Link>
      </div>
    );
  }

  if (isPOLoading) return <div className="p-8 text-center text-slate-500">Loading purchase order data...</div>;
  if (!po) return <div className="p-8 text-center text-rose-500">Purchase order not found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link 
          href={`/dashboard/purchasing/purchase-orders/${purchaseOrderId}`} 
          className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <PageHeader 
          title="Receive Goods" 
          description={`From PO: ${po.purchaseOrderCode} (${po.vendor?.name})`}
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {errors.items?.root && (
          <Alert variant="destructive">
            <AlertDescription>{errors.items.root.message}</AlertDescription>
          </Alert>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-6">1. Delivery Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Receipt Date <span className="text-rose-500">*</span></Label>
              <Input type="date" {...register("receiptDate")} />
              {errors.receiptDate && <p className="text-sm text-red-500">{errors.receiptDate.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label>Vendor Delivery Number (Surat Jalan)</Label>
              <Input placeholder="e.g. SJ-ABC-2023-01" {...register("vendorDeliveryNumber")} />
            </div>

            <div className="md:col-span-2 space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="createDebt"
                  className="rounded border-slate-300 text-primary-600 focus:ring-primary-600 w-4 h-4"
                  {...register("createDebt")}
                />
                <Label htmlFor="createDebt" className="font-medium cursor-pointer">Automatically create Debt record for this receipt</Label>
              </div>
              
              {createDebt && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="space-y-2">
                    <Label>Vendor Invoice Number <span className="text-rose-500">*</span></Label>
                    <Input placeholder="e.g. INV-ABC-001" {...register("vendorInvoiceNumber")} />
                    {errors.vendorInvoiceNumber && <p className="text-sm text-red-500">{errors.vendorInvoiceNumber.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Due Date <span className="text-rose-500">*</span></Label>
                    <Input type="date" {...register("paymentDueDate")} />
                    {errors.paymentDueDate && <p className="text-sm text-red-500">{errors.paymentDueDate.message}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">2. Received Items</h2>
            <div className="flex items-center text-sm text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              <Info className="w-4 h-4 mr-1.5" />
              <span>Accepted + Rejected must equal Received</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Product</th>
                  <th className="px-4 py-3 text-center">Outstanding</th>
                  <th className="px-4 py-3 text-center">Received</th>
                  <th className="px-4 py-3 text-center">Accepted</th>
                  <th className="px-4 py-3 text-center rounded-tr-lg">Rejected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fields.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      No outstanding items to receive.
                    </td>
                  </tr>
                )}
                {fields.map((field, index) => (
                  <tr key={field.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-900">{field.sku}</div>
                      <div className="text-xs text-slate-500">{field.productName}</div>
                    </td>
                    <td className="px-4 py-4 text-center font-medium">
                      {field.outstandingQuantity}
                    </td>
                    <td className="px-4 py-4">
                      <Input
                        type="number"
                        min="0"
                        className="w-24 mx-auto text-center h-8"
                        {...register(`items.${index}.receivedQuantity`, { valueAsNumber: true })}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setValue(`items.${index}.receivedQuantity`, val);
                          setValue(`items.${index}.acceptedQuantity`, val);
                          setValue(`items.${index}.rejectedQuantity`, 0);
                        }}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <Input
                        type="number"
                        min="0"
                        className={`w-24 mx-auto text-center h-8 ${errors.items?.[index]?.acceptedQuantity ? 'border-rose-300 focus-visible:ring-rose-500' : ''}`}
                        {...register(`items.${index}.acceptedQuantity`, { valueAsNumber: true })}
                      />
                      {errors.items?.[index]?.acceptedQuantity && (
                        <p className="text-[10px] text-red-500 mt-1 text-center">{errors.items[index]?.acceptedQuantity?.message}</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <Input
                        type="number"
                        min="0"
                        className={`w-24 mx-auto text-center h-8 ${errors.items?.[index]?.rejectedQuantity ? 'border-rose-300 focus-visible:ring-rose-500' : ''}`}
                        {...register(`items.${index}.rejectedQuantity`, { valueAsNumber: true })}
                      />
                      {errors.items?.[index]?.rejectedQuantity && (
                        <p className="text-[10px] text-red-500 mt-1 text-center">{errors.items[index]?.rejectedQuantity?.message}</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-6">3. Notes</h2>
          <Textarea rows={4} placeholder="Any notes regarding this delivery..." {...register("notes")} />
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-[140px] shadow-primary-500/30 shadow-md">
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Save Draft Receipt"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function CreateGoodsReceiptPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading form...</div>}>
      <CreateGoodsReceiptContent />
    </Suspense>
  );
}
