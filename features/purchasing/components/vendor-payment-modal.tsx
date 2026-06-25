import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { purchasingApi } from "../api";
import { useAccounts } from "../../accounts/hooks/use-accounts";
import { PaymentMethod } from "../types";
import { extractErrorMessage } from "../../../lib/error";
import { Modal } from "../../../components/ui/modal";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { formatInputMoney, unformatMoney, formatCurrency } from "../../debts/utils/formatters";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

interface VendorPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseOrderId: string;
  outstandingAmount: number;
  onSuccess: () => void;
}

const schema = z.object({
  paymentDate: z.string().min(1, "Payment date is required"),
  accountId: z.string().min(1, "Account is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  amountStr: z.string().min(1, "Total payment is required"),
  principalAmountStr: z.string().min(1, "Principal amount is required"),
  interestAmountStr: z.string().optional(),
  feeAmountStr: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => {
  const total = unformatMoney(data.amountStr);
  const principal = unformatMoney(data.principalAmountStr);
  const interest = unformatMoney(data.interestAmountStr || "0");
  const fee = unformatMoney(data.feeAmountStr || "0");
  
  // Allowing a small tolerance for floating point issues
  return Math.abs(total - (principal + interest + fee)) < 0.01;
}, {
  message: "Total Payment must equal Principal + Interest + Fee",
  path: ["amountStr"],
});

type FormData = z.infer<typeof schema>;

export function VendorPaymentModal({
  isOpen,
  onClose,
  purchaseOrderId,
  outstandingAmount,
  onSuccess,
}: VendorPaymentModalProps) {
  const [error, setError] = useState<string | null>(null);

  const { data: accounts } = useAccounts();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      paymentDate: new Date().toISOString().split("T")[0],
      accountId: "",
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      amountStr: "",
      principalAmountStr: "",
      interestAmountStr: "0",
      feeAmountStr: "0",
      notes: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        paymentDate: new Date().toISOString().split("T")[0],
        accountId: "",
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        amountStr: formatInputMoney(outstandingAmount.toString()),
        principalAmountStr: formatInputMoney(outstandingAmount.toString()),
        interestAmountStr: "0",
        feeAmountStr: "0",
        notes: "",
      });
      setError(null);
    }
  }, [isOpen, outstandingAmount, reset]);

  const onSubmit = async (data: FormData) => {
    setError(null);
    
    const amount = unformatMoney(data.amountStr);
    
    if (amount > outstandingAmount) {
      setError(`Payment amount (${formatCurrency(amount)}) cannot exceed outstanding balance (${formatCurrency(outstandingAmount)})`);
      return;
    }
    
    if (amount <= 0) {
      setError("Payment amount must be greater than 0");
      return;
    }

    try {
      await purchasingApi.createVendorPayment(purchaseOrderId, {
        paymentDate: new Date(data.paymentDate).toISOString(),
        accountId: data.accountId,
        paymentMethod: data.paymentMethod,
        amount,
        principalAmount: unformatMoney(data.principalAmountStr),
        interestAmount: unformatMoney(data.interestAmountStr || "0"),
        feeAmount: unformatMoney(data.feeAmountStr || "0"),
        notes: data.notes || undefined,
      });

      onSuccess();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Vendor Payment"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-4">
          <p className="text-sm text-indigo-700">Outstanding Balance</p>
          <p className="text-xl font-bold text-indigo-900">{formatCurrency(outstandingAmount)}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Payment Date <span className="text-rose-500">*</span></Label>
            <Input type="date" {...register("paymentDate")} />
            {errors.paymentDate && <p className="text-xs text-red-500">{errors.paymentDate.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label>Payment Method <span className="text-rose-500">*</span></Label>
            <select
              className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
              {...register("paymentMethod")}
            >
              {Object.values(PaymentMethod).map((m) => (
                <option key={m} value={m}>{m.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Cash/Bank Account <span className="text-rose-500">*</span></Label>
          <select
            className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
            {...register("accountId")}
          >
            <option value="">-- Select Account --</option>
            {accounts.map(a => (
              <option key={a.id} value={a.id}>{a.name} ({a.bankName || 'CASH'}) - Bal: {formatCurrency(Number(a.currentBalance))}</option>
            ))}
          </select>
          {errors.accountId && <p className="text-xs text-red-500">{errors.accountId.message}</p>}
        </div>

        <div className="space-y-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
          <div className="space-y-2">
            <Label>Total Payment <span className="text-rose-500">*</span></Label>
            <Input
              {...register("amountStr")}
              onChange={(e) => {
                const formatted = formatInputMoney(e.target.value);
                setValue("amountStr", formatted);
                // Also auto-fill principal if interest/fee are empty or 0
                const interest = unformatMoney(watch("interestAmountStr") || "0");
                const fee = unformatMoney(watch("feeAmountStr") || "0");
                const newTotal = unformatMoney(formatted);
                setValue("principalAmountStr", formatInputMoney((newTotal - interest - fee).toString()));
              }}
              className="font-bold text-lg"
            />
            {errors.amountStr && <p className="text-xs text-red-500">{errors.amountStr.message}</p>}
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Principal</Label>
              <Input
                {...register("principalAmountStr")}
                onChange={(e) => setValue("principalAmountStr", formatInputMoney(e.target.value))}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Interest/Penalty</Label>
              <Input
                {...register("interestAmountStr")}
                onChange={(e) => setValue("interestAmountStr", formatInputMoney(e.target.value))}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Admin Fee</Label>
              <Input
                {...register("feeAmountStr")}
                onChange={(e) => setValue("feeAmountStr", formatInputMoney(e.target.value))}
                className="h-8 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Notes</Label>
          <Textarea rows={3} {...register("notes")} placeholder="Optional notes about this payment..." />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Record Payment"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
