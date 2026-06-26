import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { extractErrorMessage } from "../../../lib/error";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Textarea } from "../../../components/ui/textarea";
import { Modal } from "../../../components/ui/modal";
import { Vendor } from "../types";
import { purchasingApi } from "../api";
import { useTranslation } from "../../../hooks/use-translation";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  address: z.string().optional(),
  taxNumber: z.string().optional(),
  paymentTermDays: z.number().min(0, "Cannot be negative"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface VendorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Vendor | null;
}

export function VendorFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: VendorFormModalProps) {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      taxNumber: "",
      paymentTermDays: 0,
      notes: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          name: initialData.name,
          contactPerson: initialData.contactPerson || "",
          phone: initialData.phone || "",
          email: initialData.email || "",
          address: initialData.address || "",
          taxNumber: initialData.taxNumber || "",
          paymentTermDays: initialData.paymentTermDays || 0,
          notes: initialData.notes || "",
        });
      } else {
        reset({
          name: "",
          contactPerson: "",
          phone: "",
          email: "",
          address: "",
          taxNumber: "",
          paymentTermDays: 0,
          notes: "",
        });
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(null);
    }
  }, [isOpen, initialData, reset]);

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      // Normalize email if empty string
      const payload = {
        ...data,
        email: data.email === "" ? undefined : data.email,
      };

      if (initialData) {
        await purchasingApi.updateVendor(initialData.id, payload);
      } else {
        await purchasingApi.createVendor(payload);
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
      title={initialData ? t("features.purchasing.vendorForm.editTitle") : t("features.purchasing.vendorForm.createTitle")}
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              {t("features.purchasing.vendorForm.name")}
            </Label>
            <Input
              id="name"
              placeholder={t("features.purchasing.vendorForm.namePh")}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPerson">{t("features.purchasing.vendorForm.contactPerson")}</Label>
            <Input
              id="contactPerson"
              placeholder={t("features.purchasing.vendorForm.contactPh")}
              {...register("contactPerson")}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              placeholder={t("features.purchasing.vendorForm.phonePh")}
              {...register("phone")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("features.purchasing.vendorForm.emailPh")}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="taxNumber">{t("features.purchasing.vendorForm.taxNumber")}</Label>
            <Input
              id="taxNumber"
              placeholder={t("features.purchasing.vendorForm.taxPh")}
              {...register("taxNumber")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentTermDays">{t("features.purchasing.vendorForm.paymentTermDays")}</Label>
            <Input
              id="paymentTermDays"
              type="number"
              min="0"
              {...register("paymentTermDays", { valueAsNumber: true })}
            />
            {errors.paymentTermDays && (
              <p className="text-sm text-red-500">
                {errors.paymentTermDays.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            rows={2}
            placeholder={t("features.purchasing.vendorForm.addressPh")}
            {...register("address")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            rows={2}
            placeholder={t("features.purchasing.vendorForm.notesPh")}
            {...register("notes")}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t("common.actions.cancel")}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? t("common.actions.saving")
              : initialData
                ? t("features.purchasing.vendorForm.updateBtn")
                : t("features.purchasing.vendorForm.createBtn")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
