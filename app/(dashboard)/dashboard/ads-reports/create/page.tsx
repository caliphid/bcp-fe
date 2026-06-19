"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "../../../../../components/ui/page-header";
import { AdsReportForm } from "../../../../../features/ads-reports/components/ads-report-form";
import { adsReportsApi } from "../../../../../features/ads-reports/api";
import { CreateAdsReportPayload } from "../../../../../types/ads";

export default function CreateAdsReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: CreateAdsReportPayload) => {
    setLoading(true);
    try {
      const res = await adsReportsApi.createReport(data);
      router.push(`/dashboard/ads-reports/${res.data.id}`);
    } catch (error) {
      console.error("Failed to create report", error);
      throw error; // Re-throw to let form handle the error display
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Buat Draft Ads Report"
        description="Masukkan data sales harian dan pengeluaran iklan Anda."
      />
      <AdsReportForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
