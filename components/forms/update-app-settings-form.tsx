"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { appSettingsApi } from "../../features/app-settings/api";
import { AppSettings } from "../../types/app-settings";
import { extractErrorMessage } from "../../lib/error";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { SearchableSelect } from "@/components/ui/searchable-select";

const schema = z.object({
  activeYear: z.number().min(2000, { message: "Active year must be 2000 or greater" }),
  currency: z.string().min(1, { message: "Currency is required" }),
  timezone: z.string().min(1, { message: "Timezone is required" }),
});

type FormData = z.infer<typeof schema>;

interface UpdateAppSettingsFormProps {
  initialData: AppSettings;
  onSuccess: () => void;
  onCancel: () => void;
}

export function UpdateAppSettingsForm({ initialData, onSuccess, onCancel }: UpdateAppSettingsFormProps) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      activeYear: initialData.activeYear,
      currency: initialData.currency,
      timezone: initialData.timezone,
    },
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      await appSettingsApi.updateSettings(data);
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

      <div className="space-y-2">
        <Label htmlFor="activeYear">Active Year</Label>
        <Input 
          id="activeYear" 
          type="number" 
          {...register("activeYear", { valueAsNumber: true })} 
        />
        {errors.activeYear && <p className="text-sm text-red-500">{errors.activeYear.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="currency">Default Currency</Label>
        <SearchableSelect
          id="currency"
          className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          {...register("currency")}
        >
          <option value="USD">USD ($)</option>
          <option value="IDR">IDR (Rp)</option>
          <option value="EUR">EUR (€)</option>
          <option value="SGD">SGD (S$)</option>
        </SearchableSelect>
        {errors.currency && <p className="text-sm text-red-500">{errors.currency.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="timezone">Timezone</Label>
        <SearchableSelect
          id="timezone"
          className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          {...register("timezone")}
        >
          <option value="UTC">UTC</option>
          <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
          <option value="America/New_York">America/New_York (EST)</option>
        </SearchableSelect>
        {errors.timezone && <p className="text-sm text-red-500">{errors.timezone.message}</p>}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </form>
  );
}
