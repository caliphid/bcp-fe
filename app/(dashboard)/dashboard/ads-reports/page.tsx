"use client";

import { Plus } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { PageHeader } from "../../../../components/ui/page-header";
import { useAuthStore } from "../../../../store/auth-store";
import { AdsReportList } from "../../../../features/ads-reports/components/ads-report-list";
import { AdsReportFilterBar } from "../../../../features/ads-reports/components/ads-report-filter-bar";
import { useAdsReports } from "../../../../features/ads-reports/hooks/use-ads-reports";
import { useAdsReportStore } from "../../../../features/ads-reports/store/ads-report-store";
import { useRouter } from "next/navigation";

export default function AdsReportsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { params } = useAdsReportStore();
  const { data, meta, isLoading } = useAdsReports(params);

  // STAFF_INPUT is allowed to create drafts, ADMIN_FINANCE and OWNER too.
  const canCreate = !!user; // basically all roles have some create access

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ads Reports"
        description="Kelola laporan harian performa iklan dan sales Anda"
      >
        {canCreate && (
          <Button onClick={() => router.push("/dashboard/ads-reports/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Buat Report Baru
          </Button>
        )}
      </PageHeader>

      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
        <div className="mb-6">
          <AdsReportFilterBar />
        </div>

        <AdsReportList
          data={data}
          meta={meta}
          loading={isLoading}
        />
      </div>
    </div>
  );
}
