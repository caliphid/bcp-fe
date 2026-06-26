"use client";

import { useState } from "react";
import { PageHeader } from "../../../../../components/ui/page-header";
import { useAuthStore } from "../../../../../store/auth-store";
import { Database, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "../../../../../components/ui/button";
import { customerApi } from "../../../../../features/customers/api";
import { extractErrorMessage } from "../../../../../lib/error";
import { Alert, AlertDescription } from "../../../../../components/ui/alert";

export default function BackfillCustomersPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user && user.role !== "OWNER") {
      router.replace("/dashboard/customers");
    }
  }, [user, router]);

  if (!user || user.role !== "OWNER") {
    return null;
  }

  const handleBackfill = async () => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      await customerApi.backfillSalesOrders();
      setSuccess(true);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Admin Tool: Backfill Sales Orders"
        description="Jalankan job background untuk mengaitkan ulang Sales Order lama dengan Customer baru berdasarkan nomor telepon."
        icon={<Database className="w-6 h-6 text-indigo-500" />}
        backUrl="/dashboard/customers"
      />

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm flex gap-3 items-start">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
          <div>
            <h4 className="font-bold text-amber-900">Perhatian!</h4>
            <p className="mt-1">
              Proses ini akan berjalan di background. Sistem akan mencari semua Sales Order yang belum memiliki <code>customerId</code>, 
              kemudian mencocokkan nomor telepon pelanggan pada pesanan tersebut dengan database Customer yang ada. Jika cocok, pesanan akan dikaitkan dengan Customer tersebut.
            </p>
            <p className="mt-2 font-semibold">Gunakan fitur ini hanya jika Anda baru saja mengimpor data customer baru secara massal.</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex gap-3 items-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-medium">Job backfill telah berhasil dijadwalkan di background. Proses ini mungkin memakan waktu beberapa menit.</span>
          </div>
        )}

        <div className="flex justify-end">
          <Button 
            onClick={handleBackfill} 
            disabled={isSubmitting || success}
            className="gap-2"
          >
            <Database className="w-4 h-4" />
            {isSubmitting ? "Menjadwalkan Job..." : "Jalankan Backfill Job"}
          </Button>
        </div>
      </div>
    </div>
  );
}
