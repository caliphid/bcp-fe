import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal } from "../../../components/ui/modal";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { 
  CustomerAddress, 
  CustomerAddressType, 
  CreateCustomerAddressRequest, 
  UpdateCustomerAddressRequest 
} from "../../../types/customer";
import { customerApi } from "../api";
import { extractErrorMessage } from "../../../lib/error";
import { useTranslation } from "../../../hooks/use-translation";

const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;

const addressSchema = z.object({
  label: z.string().optional(),
  addressType: z.nativeEnum(CustomerAddressType).optional(),
  recipientName: z.string().min(2, { message: "Nama penerima wajib diisi (min 2 karakter)" }),
  recipientPhone: z.string().regex(phoneRegex, { message: "Format nomor telepon tidak valid" }).optional().or(z.literal("")),
  addressLine1: z.string().min(5, { message: "Alamat baris 1 wajib diisi (min 5 karakter)" }),
  addressLine2: z.string().optional(),
  village: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  countryCode: z.string().optional(),
  isDefaultShipping: z.boolean().optional(),
  isDefaultBilling: z.boolean().optional(),
});

type FormData = z.infer<typeof addressSchema>;

interface CustomerAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  initialData?: CustomerAddress | null;
  onSuccess: () => void;
}

export function CustomerAddressModal({
  isOpen,
  onClose,
  customerId,
  initialData,
  onSuccess,
}: CustomerAddressModalProps) {
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: "",
      addressType: CustomerAddressType.BOTH,
      recipientName: "",
      recipientPhone: "",
      addressLine1: "",
      addressLine2: "",
      village: "",
      district: "",
      city: "",
      province: "",
      postalCode: "",
      countryCode: "ID",
      isDefaultShipping: false,
      isDefaultBilling: false,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          label: initialData.label || "",
          addressType: initialData.addressType || CustomerAddressType.BOTH,
          recipientName: initialData.recipientName || "",
          recipientPhone: initialData.recipientPhone || "",
          addressLine1: initialData.addressLine1 || "",
          addressLine2: initialData.addressLine2 || "",
          village: initialData.village || "",
          district: initialData.district || "",
          city: initialData.city || "",
          province: initialData.province || "",
          postalCode: initialData.postalCode || "",
          countryCode: initialData.countryCode || "ID",
          isDefaultShipping: initialData.isDefaultShipping || false,
          isDefaultBilling: initialData.isDefaultBilling || false,
        });
      } else {
        reset({
          label: "",
          addressType: CustomerAddressType.BOTH,
          recipientName: "",
          recipientPhone: "",
          addressLine1: "",
          addressLine2: "",
          village: "",
          district: "",
          city: "",
          province: "",
          postalCode: "",
          countryCode: "ID",
          isDefaultShipping: false,
          isDefaultBilling: false,
        });
      }
      setError(null);
    }
  }, [isOpen, initialData, reset]);

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const payload: CreateCustomerAddressRequest | UpdateCustomerAddressRequest = {
        ...data,
        label: data.label || undefined,
        recipientPhone: data.recipientPhone || undefined,
        addressLine2: data.addressLine2 || undefined,
        village: data.village || undefined,
        district: data.district || undefined,
        city: data.city || undefined,
        province: data.province || undefined,
        postalCode: data.postalCode || undefined,
      };

      if (initialData) {
        await customerApi.updateCustomerAddress(customerId, initialData.id, payload as UpdateCustomerAddressRequest);
      } else {
        await customerApi.addCustomerAddress(customerId, payload as CreateCustomerAddressRequest);
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
      title={initialData ? "Edit Alamat" : "Tambah Alamat"}
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="label">Label Alamat</Label>
            <Input id="label" placeholder="Contoh: Rumah, Kantor" {...register("label")} />
            {errors.label && <p className="text-sm text-red-500">{errors.label.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressType">Tipe Alamat</Label>
            <select
              id="addressType"
              {...register("addressType")}
              className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
            >
              {Object.values(CustomerAddressType).map((type) => (
                <option key={type} value={type}>
                  {type === 'SHIPPING' ? 'Pengiriman (Shipping)' : type === 'BILLING' ? 'Penagihan (Billing)' : 'Keduanya (Both)'}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipientName">Nama Penerima <span className="text-red-500">*</span></Label>
            <Input id="recipientName" placeholder="Contoh: Budi Santoso" {...register("recipientName")} />
            {errors.recipientName && <p className="text-sm text-red-500">{errors.recipientName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipientPhone">Nomor Telepon Penerima</Label>
            <Input id="recipientPhone" placeholder="Contoh: 08123456789" {...register("recipientPhone")} />
            {errors.recipientPhone && <p className="text-sm text-red-500">{errors.recipientPhone.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="addressLine1">Baris Alamat 1 <span className="text-red-500">*</span></Label>
          <Textarea id="addressLine1" placeholder="Nama jalan, gedung, no. rumah..." {...register("addressLine1")} className="min-h-[60px]" />
          {errors.addressLine1 && <p className="text-sm text-red-500">{errors.addressLine1.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="addressLine2">Baris Alamat 2 (Opsional)</Label>
          <Textarea id="addressLine2" placeholder="Detail tambahan..." {...register("addressLine2")} className="min-h-[40px]" />
          {errors.addressLine2 && <p className="text-sm text-red-500">{errors.addressLine2.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="village">Kelurahan</Label>
            <Input id="village" placeholder="Kelurahan" {...register("village")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="district">Kecamatan</Label>
            <Input id="district" placeholder="Kecamatan" {...register("district")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Kota/Kabupaten</Label>
            <Input id="city" placeholder="Kota" {...register("city")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="province">Provinsi</Label>
            <Input id="province" placeholder="Provinsi" {...register("province")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode">Kode Pos</Label>
            <Input id="postalCode" placeholder="Kode Pos" {...register("postalCode")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="countryCode">Kode Negara</Label>
            <Input id="countryCode" placeholder="ID" {...register("countryCode")} disabled />
          </div>
        </div>

        <div className="flex gap-6 pt-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
            <input 
              type="checkbox" 
              {...register("isDefaultShipping")} 
              className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-950" 
            />
            Jadikan Default Pengiriman
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
            <input 
              type="checkbox" 
              {...register("isDefaultBilling")} 
              className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-950" 
            />
            Jadikan Default Penagihan
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
