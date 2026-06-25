import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { accountsApi } from "../../features/accounts/api";
import { extractErrorMessage } from "../../lib/error";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { Account } from "../../types/account";
import { AccountType } from "../../types/enums";
import { BusinessUnit } from "../../types/business-unit";
import { useAuthStore } from "../../store/auth-store";
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
  type: z.nativeEnum(AccountType),
  initialBalanceStr: z.string().min(1, "Wajib diisi"),
  currentBalanceStr: z.string().min(1, "Wajib diisi"),
  accountNumber: z.string().optional(),
  bankName: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface AccountFormProps {
  initialData?: Account;
  businessUnits: BusinessUnit[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function AccountForm({ initialData, businessUnits, onSuccess, onCancel }: AccountFormProps) {
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      businessUnitId: initialData?.businessUnitId || "",
      name: initialData?.name || "",
      type: initialData?.type || AccountType.BANK,
      initialBalanceStr: initialData ? formatInputMoney(initialData.initialBalance) : "0",
      currentBalanceStr: initialData ? formatInputMoney(initialData.currentBalance) : "0",
      accountNumber: initialData?.accountNumber || "",
      bankName: initialData?.bankName || "",
      notes: initialData?.notes || "",
    },
  });

  const selectedType = watch("type");

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const payload = {
        name: data.name,
        type: data.type,
        initialBalance: unformatMoney(data.initialBalanceStr),
        currentBalance: unformatMoney(data.currentBalanceStr),
        businessUnitId: data.businessUnitId || undefined,
        accountNumber: data.accountNumber || undefined,
        bankName: data.bankName || undefined,
        notes: data.notes || undefined,
      };

      if (initialData) {
        await accountsApi.updateAccount(initialData.id, payload);
      } else {
        await accountsApi.createAccount(payload);
      }
      onSuccess();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const isEdit = !!initialData;
  const canEditCurrentBalance = !isEdit || user?.role === "OWNER";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Account Name</Label>
          <Input id="name" placeholder="e.g. BCA Utama" {...register("name")} />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Account Type</Label>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <SearchableSelect
                id="type"
                className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                {...field}
                onChange={(e: any) => field.onChange(e?.target?.value ?? e)}
              >
                {Object.values(AccountType).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </SearchableSelect>
            )}
          />
          {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="businessUnitId">Business Unit (Optional)</Label>
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
              <option value="">-- No Business Unit --</option>
              {businessUnits.map((bu) => (
                <option key={bu.id} value={bu.id}>{bu.name}</option>
              ))}
            </SearchableSelect>
          )}
        />
        {errors.businessUnitId && <p className="text-sm text-red-500">{errors.businessUnitId.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="initialBalanceStr">Initial Balance</Label>
          <Controller
            name="initialBalanceStr"
            control={control}
            render={({ field }) => (
              <Input 
                id="initialBalanceStr"
                type="text" 
                inputMode="numeric"
                disabled={isEdit}
                value={field.value}
                onChange={(e) => field.onChange(formatInputMoney(e.target.value))}
              />
            )}
          />
          {errors.initialBalanceStr && <p className="text-sm text-red-500">{errors.initialBalanceStr.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentBalanceStr">Current Balance</Label>
          <Controller
            name="currentBalanceStr"
            control={control}
            render={({ field }) => (
              <Input 
                id="currentBalanceStr"
                type="text" 
                inputMode="numeric"
                disabled={!canEditCurrentBalance}
                className={!canEditCurrentBalance ? "opacity-50 cursor-not-allowed" : ""}
                value={field.value}
                onChange={(e) => field.onChange(formatInputMoney(e.target.value))}
              />
            )}
          />
          {errors.currentBalanceStr && <p className="text-sm text-red-500">{errors.currentBalanceStr.message}</p>}
        </div>
      </div>

      {(selectedType === AccountType.BANK || selectedType === AccountType.EWALLET) && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bankName">{selectedType === AccountType.EWALLET ? 'E-Wallet Provider' : 'Bank Name'}</Label>
            <Input id="bankName" placeholder="e.g. BCA / OVO" {...register("bankName")} />
            {errors.bankName && <p className="text-sm text-red-500">{errors.bankName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number / Phone</Label>
            <Input id="accountNumber" placeholder="e.g. 1234567890" {...register("accountNumber")} />
            {errors.accountNumber && <p className="text-sm text-red-500">{errors.accountNumber.message}</p>}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" placeholder="Optional notes" {...register("notes")} />
        {errors.notes && <p className="text-sm text-red-500">{errors.notes.message}</p>}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEdit ? "Update Account" : "Create Account"}
        </Button>
      </div>
    </form>
  );
}
