"use client";
import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { purchasingApi } from "../../../../../../features/purchasing/api";
import { VendorPaymentStatus } from "../../../../../../features/purchasing/types";
import { useAuthStore } from "../../../../../../store/auth-store";
import { extractErrorMessage } from "../../../../../../lib/error";
import { Button } from "../../../../../../components/ui/button";
import { Alert, AlertDescription } from "../../../../../../components/ui/alert";
import { PageHeader } from "../../../../../../components/ui/page-header";
import { ConfirmDialog } from "../../../../../../components/ui/confirm-dialog";
import { ArrowLeft, XCircle } from "lucide-react";
import { formatCurrency } from "../../../../../../features/debts/utils/formatters";
import { formatDate } from "../../../../../../lib/utils";
import toast from "react-hot-toast";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function VendorPaymentDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const user = useAuthStore((state) => state.user);
  const isOwner = user?.role === "OWNER";
  const { token } = useAuthStore.getState();

  const { data: vpData, isLoading, error, mutate } = useSWR(
    token && id ? `/vendor-payments/${id}` : null,
    () => purchasingApi.getVendorPaymentById(id),
    { revalidateOnFocus: false }
  );

  const vp = vpData?.data;

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    showInput?: boolean;
    reason: string;
    action: (reason?: string) => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    reason: "",
    action: async () => {},
  });

  const handleAction = (
    title: string,
    message: string,
    action: (reason?: string) => Promise<any>,
    showInput: boolean = false
  ) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      showInput,
      reason: "",
      action: async (reason?: string) => {
        try {
          await action(reason);
          toast.success(`${title} successful!`);
          mutate();
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        } catch (err) {
          toast.error(extractErrorMessage(err));
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading payment...</div>;
  if (error || !vp) {
    return (
      <div className="p-8 text-center text-red-500">
        {extractErrorMessage(error) || "Vendor payment not found or voided"}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/purchasing/vendor-payments" 
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <PageHeader 
            title={vp.vendorPaymentCode} 
            description={`Vendor Payment Details`}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {isOwner && vp.status === VendorPaymentStatus.POSTED && (
            <Button
              variant="outline"
              className="border-rose-200 text-rose-700 hover:bg-rose-50"
              onClick={() => handleAction("Void Payment", "Please provide a reason for voiding. Connected cashflow will be reversed.", (reason) => purchasingApi.voidVendorPayment(id, reason!), true)}
            >
              <XCircle className="w-4 h-4 mr-2" /> Void Payment
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Payment Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Status</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${vp.status === VendorPaymentStatus.POSTED ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
              {vp.status}
            </span>
          </div>
          
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Payment Date</p>
            <p className="font-medium text-slate-800">{formatDate(vp.paymentDate)}</p>
          </div>

          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Vendor</p>
            <p className="font-medium text-slate-800">{vp.vendor?.name}</p>
          </div>

          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Purchase Order</p>
            <Link href={`/dashboard/purchasing/purchase-orders/${vp.purchaseOrderId}`} className="font-semibold text-primary-600 hover:underline">
              {vp.purchaseOrder?.purchaseOrderCode}
            </Link>
          </div>

          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Account</p>
            <p className="font-medium text-slate-800">{vp.account?.name}</p>
          </div>

          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Payment Method</p>
            <p className="font-medium text-slate-800">{vp.paymentMethod.replace(/_/g, " ")}</p>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Principal</span>
              <span className="font-medium text-slate-900">{formatCurrency(Number(vp.principalAmount || 0))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Interest / Denda</span>
              <span className="font-medium text-slate-900">{formatCurrency(Number(vp.interestAmount || 0))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Admin Fee</span>
              <span className="font-medium text-slate-900">{formatCurrency(Number(vp.feeAmount || 0))}</span>
            </div>
            <div className="pt-4 border-t border-slate-100 flex justify-between">
              <span className="font-bold text-slate-900">Total Paid</span>
              <span className="font-bold text-primary-700 text-lg">{formatCurrency(Number(vp.amount || 0))}</span>
            </div>
          </div>
          
          <div>
            {vp.notes && (
              <div className="mb-4">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Notes</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{vp.notes}</p>
              </div>
            )}
            
            {vp.voidReason && (
              <div className="p-3 bg-rose-50 rounded-lg border border-rose-100">
                <p className="text-xs text-rose-500 font-medium uppercase tracking-wider mb-1">Void Reason</p>
                <p className="text-sm text-rose-800">{vp.voidReason}</p>
                {vp.voidedAt && <p className="text-xs text-rose-600 mt-2">Voided at: {formatDate(vp.voidedAt)}</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={() => confirmDialog.action(confirmDialog.reason)}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      >
        {confirmDialog.showInput && (
          <div className="mt-4">
            <textarea
              className="w-full h-20 px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter reason (min 3 characters)..."
              value={confirmDialog.reason}
              onChange={(e) => setConfirmDialog(prev => ({ ...prev, reason: e.target.value }))}
            />
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}
