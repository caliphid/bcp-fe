import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { warehouseApi } from "../api";
import { extractErrorMessage } from "../../../lib/error";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Modal } from "../../../components/ui/modal";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Warehouse } from "../../../types/warehouse";
import { BusinessUnit } from "../../../types/business-unit";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useTranslation } from "../../../hooks/use-translation";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  warehouseCode: z.string().optional(),
  businessUnitId: z.string().optional(),
  address: z.string().optional(),
  isDefault: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

interface WarehouseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  businessUnits: BusinessUnit[];
  initialData?: Warehouse | null;
}

export function WarehouseFormModal({ isOpen, onClose, onSuccess, businessUnits, initialData }: WarehouseFormModalProps) {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name || "",
      warehouseCode: initialData?.warehouseCode || "",
      businessUnitId: initialData?.businessUnitId || "",
      address: initialData?.address || "",
      isDefault: initialData?.isDefault || false,
    },
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const payload = {
        name: data.name,
        warehouseCode: data.warehouseCode || undefined,
        businessUnitId: data.businessUnitId || undefined,
        address: data.address || undefined,
        isDefault: data.isDefault,
      };

      if (initialData) {
        await warehouseApi.updateWarehouse(initialData.id, payload);
      } else {
        await warehouseApi.createWarehouse(payload);
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
      title={initialData ? t("features.warehouses.form.editTitle") : t("features.warehouses.form.createTitle")}
      className="max-w-xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="name">{t("features.warehouses.form.name")}</Label>
          <Input id="name" placeholder={t("features.warehouses.form.namePh")} {...register("name")} />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="warehouseCode">{t("features.warehouses.form.code")}</Label>
          <Input id="warehouseCode" placeholder={t("features.warehouses.form.codePh")} {...register("warehouseCode")} />
          <p className="text-xs text-slate-500">{t("features.warehouses.form.codeNote")}</p>
          {errors.warehouseCode && <p className="text-sm text-red-500">{errors.warehouseCode.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessUnitId">{t("features.warehouses.form.businessUnit")}</Label>
          <Controller
            control={control}
            name="businessUnitId"
            render={({ field }) => (
              <SearchableSelect
                id="businessUnitId"
                className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                {...field}
                onChange={(e: any) => field.onChange(e?.target?.value ?? e)}
              >
                <option value="">{t("features.warehouses.form.noBusinessUnit")}</option>
                {businessUnits.map((bu) => (
                  <option key={bu.id} value={bu.id}>{bu.name}</option>
                ))}
              </SearchableSelect>
            )}
          />
          {errors.businessUnitId && <p className="text-sm text-red-500">{errors.businessUnitId.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">{t("features.warehouses.form.address")}</Label>
          <Input id="address" placeholder={t("features.warehouses.form.addressPh")} {...register("address")} />
          {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <input
            type="checkbox"
            id="isDefault"
            className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-600"
            {...register("isDefault")}
          />
          <Label htmlFor="isDefault" className="font-normal cursor-pointer">
            {t("features.warehouses.form.setDefault")}
          </Label>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t("common.actions.cancel")}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("common.actions.saving") : initialData ? t("common.actions.saveChanges") : t("common.actions.create")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
