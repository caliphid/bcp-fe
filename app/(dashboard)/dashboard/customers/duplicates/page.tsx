"use client";

import { useCustomerDuplicates } from "../../../../../features/customers/hooks/use-customers";
import { DuplicateReviewList } from "../../../../../features/customers/components/duplicate-review-list";
import { PageHeader } from "../../../../../components/ui/page-header";
import { useAuthStore } from "../../../../../store/auth-store";
import { Users, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Pagination } from "../../../../../components/ui/pagination";

export default function DuplicateCustomersPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("POSSIBLE_DUPLICATE");
  
  const { data, meta, isLoading, mutate } = useCustomerDuplicates({ page, limit: 10, status: status as any });

  useEffect(() => {
    if (user && user.role !== "OWNER" && user.role !== "ADMIN_FINANCE") {
      router.replace("/dashboard/customers");
    }
  }, [user, router]);

  if (!user || (user.role !== "OWNER" && user.role !== "ADMIN_FINANCE")) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Review Duplikat Customer"
        description="Daftar kandidat customer yang terdeteksi duplikat oleh sistem."
        icon={<AlertTriangle className="w-6 h-6 text-amber-500" />}
        backHref="/dashboard/customers"
      />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex gap-4 overflow-x-auto">
        <button 
          onClick={() => { setStatus("POSSIBLE_DUPLICATE"); setPage(1); }}
          className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${status === "POSSIBLE_DUPLICATE" ? "bg-amber-100 text-amber-700" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
        >
          Perlu Direview
        </button>
        <button 
          onClick={() => { setStatus("CONFIRMED_DUPLICATE"); setPage(1); }}
          className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${status === "CONFIRMED_DUPLICATE" ? "bg-rose-100 text-rose-700" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
        >
          Dikonfirmasi Duplikat
        </button>
        <button 
          onClick={() => { setStatus("NOT_DUPLICATE"); setPage(1); }}
          className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${status === "NOT_DUPLICATE" ? "bg-emerald-100 text-emerald-700" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
        >
          Bukan Duplikat
        </button>
        <button 
          onClick={() => { setStatus("MERGED"); setPage(1); }}
          className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${status === "MERGED" ? "bg-purple-100 text-purple-700" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
        >
          Sudah Di-merge
        </button>
      </div>

      {isLoading ? (
        <div className="h-64 bg-slate-50 animate-pulse rounded-2xl border border-slate-100"></div>
      ) : (
        <>
          <DuplicateReviewList 
            candidates={data || []} 
            onReviewed={() => mutate()} 
          />
          {meta && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <Pagination meta={meta} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
