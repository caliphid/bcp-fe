"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useAuthStore } from "../../../../../store/auth-store";
import { useAdsReportDetail } from "../../../../../features/ads-reports/hooks/use-ads-reports";
import { adsReportsApi } from "../../../../../features/ads-reports/api";
import { AdsReportDetailView } from "../../../../../features/ads-reports/components/ads-report-detail";
import { PostReportModal } from "../../../../../features/ads-reports/components/post-report-modal";
import { VoidReportModal } from "../../../../../features/ads-reports/components/void-report-modal";
import { PostAdsReportPayload } from "../../../../../types/ads";

export default function AdsReportDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuthStore();
  const { data: report, isLoading, mutate } = useAdsReportDetail(id);

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isVoidModalOpen, setIsVoidModalOpen] = useState(false);

  const isOwnerOrFinance = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE";
  const canPost = isOwnerOrFinance && report?.status === "DRAFT";
  const canVoid = isOwnerOrFinance && report?.status === "POSTED";

  const handlePostSubmit = async (payload: PostAdsReportPayload) => {
    await adsReportsApi.postReport(id, payload);
    mutate();
  };

  const handleVoidSubmit = async (reason: string) => {
    await adsReportsApi.voidReport(id, { voidReason: reason });
    mutate();
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-sm">
        <p className="text-slate-500">Loading detail...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-sm">
        <p className="text-slate-500">Report tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <AdsReportDetailView
        report={report}
        canPost={canPost}
        canVoid={canVoid}
        onPostClick={() => setIsPostModalOpen(true)}
        onVoidClick={() => setIsVoidModalOpen(true)}
      />

      <PostReportModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        reportCode={report.reportCode}
        onSubmit={handlePostSubmit}
      />

      <VoidReportModal
        isOpen={isVoidModalOpen}
        onClose={() => setIsVoidModalOpen(false)}
        reportCode={report.reportCode}
        onSubmit={handleVoidSubmit}
      />
    </div>
  );
}
