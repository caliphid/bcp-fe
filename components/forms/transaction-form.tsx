import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { transactionsApi } from "../../features/transactions/api";
import { extractErrorMessage } from "../../lib/error";
import { env } from "../../lib/env";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { Transaction } from "../../types/transaction";
import { TransactionType } from "../../types/enums";
import { BusinessUnit } from "../../types/business-unit";
import { Account } from "../../types/account";
import { Category } from "../../types/category";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { ImageCropUpload } from "../ui/image-crop-upload";

const schema = z.object({
  transactionDate: z.string().min(1, { message: "Date is required" }),
  businessUnitId: z.string().optional(),
  accountId: z.string().min(1, { message: "Account is required" }),
  categoryId: z.string().min(1, { message: "Category is required" }),
  type: z.nativeEnum(TransactionType),
  amount: z
    .any()
    .transform((v) => Number(v))
    .refine((v) => !isNaN(v) && v > 0, {
      message: "Amount must be greater than 0",
    }),
  description: z
    .string()
    .max(255, { message: "Description too long" })
    .optional(),
  notes: z.string().optional(),
  attachmentUrl: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface TransactionFormProps {
  initialData?: Transaction;
  businessUnits: BusinessUnit[];
  accounts: Account[];
  categories: Category[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function TransactionForm({
  initialData,
  businessUnits,
  accounts,
  categories,
  onSuccess,
  onCancel,
}: TransactionFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const defaultDate = initialData
    ? new Date(initialData.transactionDate).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      transactionDate: defaultDate,
      businessUnitId: initialData?.businessUnit?.id || "",
      accountId: initialData?.account?.id || "",
      categoryId: initialData?.category?.id || "",
      type: initialData?.type || TransactionType.OUT,
      amount: initialData ? Number(initialData.amount) : 0,
      description: initialData?.description || "",
      notes: initialData?.notes || "",
      attachmentUrl: initialData?.attachmentUrl || "",
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedType = watch("type");

  const filteredCategories = categories.filter(
    (c) => c.type === "BOTH" || (c.type as string) === (selectedType as string),
  );

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      let finalAttachmentUrl = data.attachmentUrl;

      if (attachmentFile) {
        setIsUploading(true);
        try {
          const res = await transactionsApi.uploadFile(attachmentFile);
          finalAttachmentUrl = res.url;
        } catch {
          throw new Error("Failed to upload attachment");
        } finally {
          setIsUploading(false);
        }
      }

      const payload = {
        ...data,
        businessUnitId: data.businessUnitId || undefined,
        description: data.description || undefined,
        notes: data.notes || undefined,
        attachmentUrl: finalAttachmentUrl || undefined,
      };

      if (initialData) {
        await transactionsApi.updateTransaction(initialData.id, payload);
      } else {
        await transactionsApi.createTransaction(payload);
      }
      onSuccess();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const isEdit = !!initialData;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="transactionDate">Date</Label>
          <Input
            id="transactionDate"
            type="date"
            {...register("transactionDate")}
          />
          {errors.transactionDate && (
            <p className="text-sm text-red-500">
              {errors.transactionDate.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <SearchableSelect
                id="type"
                className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  setValue("categoryId", ""); // Reset category when type changes
                }}
              >
                {Object.values(TransactionType).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </SearchableSelect>
            )}
          />
          {errors.type && (
            <p className="text-sm text-red-500">{errors.type.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="accountId">Account</Label>
          <Controller
            control={control}
            name="accountId"
            render={({ field }) => (
              <SearchableSelect
                id="accountId"
                className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                {...field}
              >
                <option value="">-- Select Account --</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.type})
                  </option>
                ))}
              </SearchableSelect>
            )}
          />
          {errors.accountId && (
            <p className="text-sm text-red-500">{errors.accountId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoryId">Category</Label>
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <SearchableSelect
                id="categoryId"
                className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                {...field}
              >
                <option value="">-- Select Category --</option>
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </SearchableSelect>
            )}
          />
          {errors.categoryId && (
            <p className="text-sm text-red-500">{errors.categoryId.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            {...register("amount")}
          />
          {errors.amount && (
            <p className="text-sm text-red-500">{errors.amount.message}</p>
          )}
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
              >
                <option value="">-- No Business Unit --</option>
                {businessUnits.map((bu) => (
                  <option key={bu.id} value={bu.id}>
                    {bu.name}
                  </option>
                ))}
              </SearchableSelect>
            )}
          />
          {errors.businessUnitId && (
            <p className="text-sm text-red-500">
              {errors.businessUnitId.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Input
          id="description"
          placeholder="Brief description"
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Input
          id="notes"
          placeholder="Additional notes"
          {...register("notes")}
        />
        {errors.notes && (
          <p className="text-sm text-red-500">{errors.notes.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="attachment">Attachment Proof (Optional)</Label>
        <ImageCropUpload
          onFileSelect={(file) => setAttachmentFile(file)}
          previewUrl={
            initialData?.attachmentUrl
              ? initialData.attachmentUrl.startsWith("http")
                ? initialData.attachmentUrl
                : `${env.NEXT_PUBLIC_API_URL}${initialData.attachmentUrl}`
              : ""
          }
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || isUploading}>
          {isSubmitting || isUploading
            ? "Saving..."
            : isEdit
              ? "Update Transaction"
              : "Create Transaction"}
        </Button>
      </div>
    </form>
  );
}
