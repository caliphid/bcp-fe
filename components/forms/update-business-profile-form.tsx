"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { businessProfileApi } from "../../features/business-profile/api";
import { BusinessProfile } from "../../types/business-profile";
import { extractErrorMessage } from "../../lib/error";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";

const schema = z.object({
  businessName: z.string().min(2, { message: "Business name must be at least 2 characters" }),
  legalName: z.string().min(2, { message: "Legal name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().min(1, { message: "Phone is required" }),
  address: z.string().min(1, { message: "Address is required" }),
  logoUrl: z.string().url({ message: "Invalid URL" }).optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

interface UpdateBusinessProfileFormProps {
  initialData: BusinessProfile;
  onSuccess: () => void;
  onCancel: () => void;
}

export function UpdateBusinessProfileForm({ initialData, onSuccess, onCancel }: UpdateBusinessProfileFormProps) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      businessName: initialData.businessName || "",
      legalName: initialData.legalName || "",
      email: initialData.email || "",
      phone: initialData.phone || "",
      address: initialData.address || "",
      logoUrl: initialData.logoUrl || "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      await businessProfileApi.updateProfile(data);
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
          <Label htmlFor="businessName">Business Name</Label>
          <Input id="businessName" {...register("businessName")} />
          {errors.businessName && <p className="text-sm text-red-500">{errors.businessName.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="legalName">Legal Name (PT/CV)</Label>
          <Input id="legalName" {...register("legalName")} />
          {errors.legalName && <p className="text-sm text-red-500">{errors.legalName.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" {...register("phone")} />
          {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="logoUrl">Logo URL (Optional)</Label>
        <Input id="logoUrl" placeholder="https://example.com/logo.png" {...register("logoUrl")} />
        {errors.logoUrl && <p className="text-sm text-red-500">{errors.logoUrl.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Registered Address</Label>
        <Input id="address" {...register("address")} />
        {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
