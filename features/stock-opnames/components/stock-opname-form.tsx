import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AsyncSearchableSelect } from "@/components/ui/async-searchable-select";
import { AlertCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { stockOpnameApi } from "../api";
import { warehouseApi } from "../../warehouses/api";
import { productApi } from "../../products/api";
import { usersApi } from "../../users/api";
import { StockOpnameCountMode, StockOpnameScopeType } from "../../../types/stock-opname";
import { Alert, AlertDescription } from "@/components/ui/alert";
import dayjs from "dayjs";

const schema = z.object({
  name: z.string().min(3, "Session name is required"),
  warehouseId: z.string().min(1, "Warehouse is required"),
  sessionDate: z.string().min(1, "Date is required"),
  description: z.string().optional(),
  countMode: z.nativeEnum(StockOpnameCountMode),
  scopeType: z.nativeEnum(StockOpnameScopeType),
  freezeInventory: z.boolean().optional(),
  allowMultipleCounts: z.boolean().optional(),
  productIds: z.array(z.string()).optional(),
  counterIds: z.array(z.string()).optional(),
}).superRefine((data, ctx) => {
  if (data.scopeType === StockOpnameScopeType.PARTIAL) {
    if (!data.productIds || data.productIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one product filter must be selected for PARTIAL scope",
        path: ["productIds"]
      });
    }
  }
});

type FormData = z.infer<typeof schema>;

export function StockOpnameForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      sessionDate: dayjs().format('YYYY-MM-DD'),
      countMode: StockOpnameCountMode.NON_BLIND,
      scopeType: StockOpnameScopeType.FULL,
      freezeInventory: false,
      allowMultipleCounts: true,
      productIds: [],
      counterIds: [],
    }
  });

  const scopeType = watch("scopeType");
  const freezeInventory = watch("freezeInventory");

  const loadWarehouses = async (search: string) => {
    try {
      const res = await warehouseApi.getWarehouses({ search, limit: 20 });
      return res.data?.map((w: any) => ({ label: w.name, value: w.id })) || [];
    } catch {
      return [];
    }
  };

  const loadProducts = async (search: string) => {
    try {
      const res = await productApi.getProducts({ search, limit: 20 });
      return res.data?.map((p: any) => ({ label: p.name, value: p.id })) || [];
    } catch {
      return [];
    }
  };

  const loadUsers = async (search: string) => {
    try {
      const res = await usersApi.getUsers({ search, limit: 20 });
      return res.data?.map((u: any) => ({ label: u.name, value: u.id })) || [];
    } catch {
      return [];
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setErrorMsg("");
    
    try {
      const res = await stockOpnameApi.createSession({
        ...data,
        productIds: data.scopeType === StockOpnameScopeType.PARTIAL ? data.productIds : undefined,
      });
      toast.success("Stock Opname Session created successfully");
      router.push(`/dashboard/stock-opnames/${res.data.id}`);
    } catch (error: any) {
      setErrorMsg(error?.response?.data?.message || "Failed to create session");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {errorMsg && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Basic Info</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Session Name <span className="text-rose-500">*</span></label>
            <Input {...register("name")} placeholder="e.g. End of Year Count 2026" />
            {errors.name && <p className="text-xs text-rose-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Session Date <span className="text-rose-500">*</span></label>
            <Input type="date" {...register("sessionDate")} />
            {errors.sessionDate && <p className="text-xs text-rose-500">{errors.sessionDate.message}</p>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">Warehouse <span className="text-rose-500">*</span></label>
            <Controller
              name="warehouseId"
              control={control}
              render={({ field }) => (
                <AsyncSearchableSelect
                  value={field.value}
                  onChange={(e: any) => {
                    field.onChange(Array.isArray(e) ? e.map(item => item?.target?.value || item?.value) : (e?.target?.value || e?.value || e));
                  }}
                  loadOptions={loadWarehouses}
                  placeholder="Select warehouse..."
                />
              )}
            />
            {errors.warehouseId && <p className="text-xs text-rose-500">{errors.warehouseId.message}</p>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">Description</label>
            <Textarea {...register("description")} placeholder="Optional description or notes" rows={3} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Scope & Mode</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Scope Type</label>
            <select
              className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
              {...register("scopeType")}
            >
              <option value={StockOpnameScopeType.FULL}>FULL (All Items in Warehouse)</option>
              <option value={StockOpnameScopeType.PARTIAL}>PARTIAL (Selected Filters)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Count Mode</label>
            <select
              className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
              {...register("countMode")}
            >
              <option value={StockOpnameCountMode.NON_BLIND}>NON-BLIND (Show Expected Qty)</option>
              <option value={StockOpnameCountMode.BLIND}>BLIND (Hide Expected Qty)</option>
            </select>
            <p className="text-xs text-slate-500">Blind mode hides system quantity from staff counters.</p>
          </div>

          {scopeType === StockOpnameScopeType.PARTIAL && (
            <div className="space-y-2 md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="text-sm font-semibold text-slate-700">Filter Products (Required for Partial)</label>
              <Controller
                name="productIds"
                control={control}
                render={({ field }) => (
                  <div>
                    {field.value?.map((id, idx) => (
                      <div key={idx} className="flex gap-2 mb-2">
                        <AsyncSearchableSelect
                          value={id}
                          onChange={(e: any) => {
                            const newVals = [...(field.value || [])];
                            newVals[idx] = e?.target?.value || e?.value || e;
                            field.onChange(newVals);
                          }}
                          loadOptions={loadProducts}
                          placeholder="Select product..."
                        />
                        <Button type="button" variant="outline" className="text-rose-500 hover:text-rose-600" onClick={() => {
                          const newVals = [...(field.value || [])];
                          newVals.splice(idx, 1);
                          field.onChange(newVals);
                        }}>Remove</Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => field.onChange([...(field.value || []), ""])}>
                      + Add Product Filter
                    </Button>
                  </div>
                )}
              />
              {errors.productIds && <p className="text-xs text-rose-500">{errors.productIds.message}</p>}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Assignments & Options</h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Assigned Counters (Optional)</label>
            <Controller
              name="counterIds"
              control={control}
              render={({ field }) => (
                <div>
                  {field.value?.map((id, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <AsyncSearchableSelect
                        value={id}
                        onChange={(e: any) => {
                          const newVals = [...(field.value || [])];
                          newVals[idx] = e?.target?.value || e?.value || e;
                          field.onChange(newVals);
                        }}
                        loadOptions={loadUsers}
                        placeholder="Select staff/counter..."
                      />
                      <Button type="button" variant="outline" className="text-rose-500 hover:text-rose-600" onClick={() => {
                        const newVals = [...(field.value || [])];
                        newVals.splice(idx, 1);
                        field.onChange(newVals);
                      }}>Remove</Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => field.onChange([...(field.value || []), ""])}>
                    + Assign User
                  </Button>
                </div>
              )}
            />
            <p className="text-xs text-slate-500">If left empty, any staff can submit counts.</p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input type="checkbox" id="freezeInventory" className="w-4 h-4" {...register("freezeInventory")} />
            <label htmlFor="freezeInventory" className="text-sm font-semibold text-slate-700">Freeze Inventory Indicator</label>
          </div>
          {freezeInventory && (
            <div className="bg-amber-50 text-amber-700 p-3 rounded-md text-xs font-medium border border-amber-200">
              Note: This is an informational flag only. It does not hard-lock transactions across the system.
            </div>
          )}
          
          <div className="flex items-center gap-3 pt-2">
            <input type="checkbox" id="allowMultipleCounts" className="w-4 h-4" {...register("allowMultipleCounts")} />
            <label htmlFor="allowMultipleCounts" className="text-sm font-semibold text-slate-700">Allow Multiple Counts</label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 sticky bottom-0 bg-white p-4 border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] rounded-t-xl z-10">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Create Session
        </Button>
      </div>
    </form>
  );
}
