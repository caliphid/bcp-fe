"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../../../../store/auth-store";
import { useCashbonSummary } from "../../../../../features/crew-cashbons/hooks/use-cashbon-summary";
import { crewCashbonsApi } from "../../../../../features/crew-cashbons/api";
import { CashbonSummaryCards } from "../../../../../features/crew-cashbons/components/cashbon-summary-cards";
import { PageHeader } from "../../../../../components/ui/page-header";
import { CashbonByCrewItem, CrewCashbonItem } from "../../../../../types/crew-cashbon";
import { formatCurrency, formatDate } from "../../../../../features/debts/utils/formatters";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "../../../../../components/ui/button";

export default function CrewCashbonsSummaryPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  
  const [byCrew, setByCrew] = useState<CashbonByCrewItem[]>([]);
  const [outstanding, setOutstanding] = useState<CrewCashbonItem[]>([]);
  const [overdue, setOverdue] = useState<CrewCashbonItem[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(true);

  const { data: summary, loading: loadingSummary } = useCashbonSummary();

  useEffect(() => {
    if (user?.role === "STAFF_INPUT") {
       router.replace("/dashboard/crew-cashbons");
       return;
    }
    const loadData = async () => {
      try {
        const [crewRes, outRes, ovRes] = await Promise.all([
          crewCashbonsApi.getByCrew({ limit: 10, sortBy: "totalOutstanding", sortOrder: "desc" }),
          crewCashbonsApi.getOutstanding({ limit: 10, sortBy: "remainingBalance", sortOrder: "desc" }),
          crewCashbonsApi.getOverdue({ limit: 10, sortBy: "dueDate", sortOrder: "asc" }),
        ]);
        setByCrew(crewRes.data || []);
        setOutstanding(outRes.data || []);
        setOverdue(ovRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingExtras(false);
      }
    };
    loadData();
  }, [user, router]);

  if (user?.role === "STAFF_INPUT") return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" className="shrink-0" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        <PageHeader
          title="Cashbon Summary & Analytics"
          description="Laporan rekapitulasi cashbon seluruh crew."
        />
      </div>

      <CashbonSummaryCards data={summary!} loading={loadingSummary} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* By Crew Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-semibold text-slate-900">Top Outstanding by Crew</h3>
          </div>
          <div className="overflow-x-auto">
            {loadingExtras ? (
              <div className="p-8 text-center animate-pulse">Loading...</div>
            ) : byCrew.length === 0 ? (
              <div className="p-8 text-center text-slate-500">Tidak ada data.</div>
            ) : (
              <table className="w-full text-sm text-left text-slate-600">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                  <tr>
                    <th className="px-5 py-3 font-medium">Crew</th>
                    <th className="px-5 py-3 font-medium text-right">Cashbon Aktif</th>
                    <th className="px-5 py-3 font-medium text-right">Outstanding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {byCrew.map((c) => (
                    <tr key={c.crewId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-900">{c.crewName}</p>
                        <p className="text-xs text-slate-500">{c.position || "-"}</p>
                      </td>
                      <td className="px-5 py-4 text-right font-medium">
                        {c.cashbonCount}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <p className="font-bold text-rose-600">{formatCurrency(c.totalOutstanding)}</p>
                        <p className="text-xs text-slate-500">Total: {formatCurrency(c.totalPrincipal)}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Overdue Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-semibold text-rose-700">Cashbon Overdue</h3>
          </div>
          <div className="overflow-x-auto">
            {loadingExtras ? (
              <div className="p-8 text-center animate-pulse">Loading...</div>
            ) : overdue.length === 0 ? (
              <div className="p-8 text-center text-slate-500">Tidak ada cashbon yang jatuh tempo.</div>
            ) : (
              <table className="w-full text-sm text-left text-slate-600">
                <thead className="bg-rose-50/50 text-slate-500 text-xs uppercase">
                  <tr>
                    <th className="px-5 py-3 font-medium">Cashbon</th>
                    <th className="px-5 py-3 font-medium">Due Date</th>
                    <th className="px-5 py-3 font-medium text-right">Outstanding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {overdue.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => router.push(`/dashboard/crew-cashbons/${o.id}`)}>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-900">{o.cashbonCode}</p>
                        <p className="text-xs text-slate-500">{o.crew.name}</p>
                      </td>
                      <td className="px-5 py-4 text-rose-600 font-medium">
                        {o.dueDate ? formatDate(o.dueDate) : "-"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <span className="font-bold text-rose-600">{formatCurrency(o.remainingBalance)}</span>
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
