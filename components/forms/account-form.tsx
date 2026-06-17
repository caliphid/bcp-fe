import { useState } from "react";
import { useForm } from "react-hook-form";
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

const schema = z.object({
  businessUnitId: z.string().optional(),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  type: z.nativeEnum(AccountType),
  initialBalance: z.coerce.number().min(0, { message: "Initial balance must be positive" }),
  currentBalance: z.coerce.number().min(0, { message: "Current balance must be positive" }),
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
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      businessUnitId: initialData?.businessUnitId || "",
      name: initialData?.name || "",
      type: initialData?.type || AccountType.BANK,
      initialBalance: initialData ? Number(initialData.initialBalance) : 0,
      currentBalance: initialData ? Number(initialData.currentBalance) : 0,
      accountNumber: initialData?.accountNumber || "",
      bankName: initialData?.bankName || "",
      notes: initialData?.notes || "",
    },
  });

  const selectedType = watch("type");

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      // Clean up optional fields
      const payload = {
        ...data,
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
          <select
            id="type"
            className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            {...register("type")}
          >
            {Object.values(AccountType).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="businessUnitId">Business Unit (Optional)</Label>
        <select
          id="businessUnitId"
          className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          {...register("businessUnitId")}
        >
          <option value="">-- No Business Unit --</option>
          {businessUnits.map((bu) => (
            <option key={bu.id} value={bu.id}>{bu.name}</option>
          ))}
        </select>
        {errors.businessUnitId && <p className="text-sm text-red-500">{errors.businessUnitId.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="initialBalance">Initial Balance</Label>
          <Input id="initialBalance" type="number" {...register("initialBalance")} disabled={isEdit} />
          {errors.initialBalance && <p className="text-sm text-red-500">{errors.initialBalance.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentBalance">Current Balance</Label>
          <Input 
            id="currentBalance" 
            type="number" 
            {...register("currentBalance")} 
            disabled={!canEditCurrentBalance}
            className={!canEditCurrentBalance ? "opacity-50 cursor-not-allowed" : ""}
          />
          {errors.currentBalance && <p className="text-sm text-red-500">{errors.currentBalance.message}</p>}
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
