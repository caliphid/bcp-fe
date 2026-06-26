import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { customerApi } from "../api";
import { useBusinessUnits } from "../../business-units/hooks/use-business-units";
import { extractErrorMessage } from "../../../lib/error";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Textarea } from "../../../components/ui/textarea";
import { Customer, CustomerType, CustomerSource, CustomerStatus } from "../../../types/customer";
import { useRouter } from "next/navigation";
import { useTranslation } from "../../../hooks/use-translation";
import { X } from "lucide-react";

const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;

const addressSchema = z.object({
  recipientName: z.string().min(2, { message: "Nama penerima wajib diisi (min 2 karakter)" }),
  recipientPhone: z.string().regex(phoneRegex, { message: "Format nomor telepon tidak valid" }).optional().or(z.literal("")),
  addressLine1: z.string().min(5, { message: "Alamat baris 1 wajib diisi (min 5 karakter)" }),
  addressLine2: z.string().optional(),
  village: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  countryCode: z.string().default("ID"),
});

const schema = z.object({
  fullName: z.string().min(2, { message: "Nama lengkap wajib diisi (min 2 karakter)" }),
  phone: z.string().regex(phoneRegex, { message: "Format nomor telepon tidak valid" }).optional().or(z.literal("")),
  whatsapp: z.string().regex(phoneRegex, { message: "Format WhatsApp tidak valid" }).optional().or(z.literal("")),
  email: z.string().email({ message: "Format email tidak valid" }).optional().or(z.literal("")),
  companyName: z.string().optional(),
  taxNumber: z.string().optional(),
  businessUnitId: z.string().optional(),
  customerType: z.nativeEnum(CustomerType).default(CustomerType.RETAIL),
  source: z.nativeEnum(CustomerSource).default(CustomerSource.MANUAL),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  status: z.nativeEnum(CustomerStatus).optional(), // only for edit
  address: addressSchema.optional(), // only for create
});

type FormData = z.infer<typeof schema>;

interface CustomerFormProps {
  initialData?: Customer;
  onSuccess?: (customer: Customer) => void;
  onCancel?: () => void;
}

export function CustomerForm({ initialData, onSuccess, onCancel }: CustomerFormProps) {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: initialData?.fullName || "",
      phone: initialData?.phone || "",
      whatsapp: initialData?.whatsapp || "",
      email: initialData?.email || "",
      customerType: initialData?.customerType || CustomerType.RETAIL,
      source: initialData?.source || CustomerSource.MANUAL,
    },
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const payload: any = {
        fullName: data.fullName,
        phone: data.phone || undefined,
        whatsapp: data.whatsapp || undefined,
        email: data.email || undefined,
        companyName: data.companyName || undefined,
        taxNumber: data.taxNumber || undefined,
        businessUnitId: data.businessUnitId || undefined,
        customerType: data.customerType,
        source: data.source,
        notes: data.notes || undefined,
        tags: data.tags,
      };

      if (initialData) {
        payload.status = data.status;
        const res = await customerApi.updateCustomer(initialData.id, payload);
        if (onSuccess) {
          onSuccess(res.data);
        } else {
          router.push(`/dashboard/customers/${initialData.id}`);
        }
      } else {
        if (data.address && data.address.recipientName && data.address.addressLine1) {
          payload.addresses = [{
            ...data.address,
            isDefaultShipping: true,
            isDefaultBilling: true
          }];
        }
        const res = await customerApi.createCustomer(payload);
        if (onSuccess) {
          onSuccess(res.data);
        } else {
          router.push(`/dashboard/customers/${res.data.id}`);
        }
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className={`grid grid-cols-1 gap-6 ${!initialData ? 'md:grid-cols-2' : 'w-full'}`}>
        {/* Basic Info */}
        <div className="space-y-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Informasi Dasar</h3>
          
          <div className="space-y-2">
            <Label htmlFor="fullName">Nama Lengkap <span className="text-red-500">*</span></Label>
            <Input id="fullName" placeholder="Contoh: Budi Santoso" {...register("fullName")} />
            {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Nomor Telepon</Label>
            <Input id="phone" placeholder="Contoh: 08123456789" {...register("phone")} />
            {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">Nomor WhatsApp</Label>
            <Input id="whatsapp" placeholder="Contoh: 08123456789" {...register("whatsapp")} />
            {errors.whatsapp && <p className="text-sm text-red-500">{errors.whatsapp.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="Contoh: budi@example.com" {...register("email")} />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerType">Tipe Customer</Label>
              <select
                {...register("customerType")}
                className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
              >
                {Object.values(CustomerType).map((type) => (
                  <option key={type} value={type}>{t(`common.labels.${type}`)}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Sumber</Label>
              <select
                {...register("source")}
                className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
              >
                {Object.values(CustomerSource).map((src) => (
                  <option key={src} value={src}>{t(`common.labels.${src}`)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Address Form (Only on Create) */}
        {!initialData && (
          <div className="space-y-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Alamat Utama (Opsional)</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address.recipientName">Nama Penerima</Label>
              <Input id="address.recipientName" placeholder="Contoh: Budi Santoso" {...register("address.recipientName")} />
              {errors.address?.recipientName && <p className="text-sm text-red-500">{errors.address.recipientName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address.recipientPhone">Nomor Telepon Penerima</Label>
              <Input id="address.recipientPhone" placeholder="Contoh: 08123456789" {...register("address.recipientPhone")} />
              {errors.address?.recipientPhone && <p className="text-sm text-red-500">{errors.address.recipientPhone.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address.addressLine1">Baris Alamat 1</Label>
            <Textarea id="address.addressLine1" placeholder="Nama jalan, gedung, no. rumah..." {...register("address.addressLine1")} className="min-h-[60px]" />
            {errors.address?.addressLine1 && <p className="text-sm text-red-500">{errors.address.addressLine1.message}</p>}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address.village">Kelurahan</Label>
              <Input id="address.village" placeholder="Kelurahan" {...register("address.village")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address.district">Kecamatan</Label>
              <Input id="address.district" placeholder="Kecamatan" {...register("address.district")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address.city">Kota/Kabupaten</Label>
              <Input id="address.city" placeholder="Kota" {...register("address.city")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address.province">Provinsi</Label>
              <Input id="address.province" placeholder="Provinsi" {...register("address.province")} />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address.postalCode">Kode Pos</Label>
              <Input id="address.postalCode" placeholder="Kode Pos" {...register("address.postalCode")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address.countryCode">Kode Negara</Label>
              <Input id="address.countryCode" placeholder="ID" {...register("address.countryCode")} disabled />
            </div>
          </div>
        </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-6">
        <Button type="button" variant="ghost" onClick={() => onCancel ? onCancel() : router.back()}>
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : initialData ? "Simpan Perubahan" : "Buat Customer"}
        </Button>
      </div>
    </form>
  );
}
