"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { useAuthStore } from "../../../../store/auth-store";
import {
  useAdsSummary,
  useAdsDailyPerformance,
  useAdsMonthlyPerformance,
  useAdsProductPerformance,
  useAdsPlatformPerformance,
  useAdsCampaignPerformance,
} from "../../../../features/ads-reports/hooks/use-ads-analytics";
import { AdsSummaryCards } from "../../../../features/ads-analytics/components/ads-summary-cards";
import {
  AdsDailyTrendChart,
  AdsMonthlyTrendChart,
} from "../../../../features/ads-analytics/components/ads-performance-charts";
import {
  AdsProductPerformanceTable,
  AdsPlatformPerformanceTable,
  AdsCampaignPerformanceTable,
} from "../../../../features/ads-analytics/components/ads-performance-tables";
import { useBusinessUnits } from "../../../../features/business-units/hooks/use-business-units";
import { useAdPlatforms } from "../../../../features/ad-platforms/hooks/use-ad-platforms";
import { useAdCampaigns } from "../../../../features/ad-campaigns/hooks/use-ad-campaigns";
import { SearchableSelect } from "@/components/ui/searchable-select";

export default function AdsAnalyticsPage() {
  const { user } = useAuthStore();
  const isOwnerOrFinance =
    user?.role === "OWNER" || user?.role === "ADMIN_FINANCE";

  const [datePreset, setDatePreset] = useState<"today" | "this_week" | "this_month" | "custom">("this_month");

  const getToday = () => {
    const d = new Date();
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().split("T")[0];
  }
  const getThisWeekStart = () => {
    const d = new Date();
    const day = d.getDay() || 7; 
    d.setDate(d.getDate() - day + 1);
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().split("T")[0];
  }
  const getThisWeekEnd = () => {
    const d = new Date();
    const day = d.getDay() || 7; 
    d.setDate(d.getDate() - day + 7);
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().split("T")[0];
  }

  const [filters, setFilters] = useState({
    businessUnitId: "",
    platformId: "",
    campaignId: "",
    month: new Date().getMonth() + 1 as number | "",
    year: new Date().getFullYear() as number | "",
    startDate: "",
    endDate: "",
  });

  const handlePresetChange = (preset: "today" | "this_week" | "this_month" | "custom") => {
    setDatePreset(preset);
    if (preset === "today") {
      setFilters(prev => ({ ...prev, month: "", year: "", startDate: getToday(), endDate: getToday() }));
    } else if (preset === "this_week") {
      setFilters(prev => ({ ...prev, month: "", year: "", startDate: getThisWeekStart(), endDate: getThisWeekEnd() }));
    } else if (preset === "this_month") {
      setFilters(prev => ({ ...prev, month: new Date().getMonth() + 1, year: new Date().getFullYear(), startDate: "", endDate: "" }));
    }
  };

  const { data: businessUnits } = useBusinessUnits();
  const { data: platforms } = useAdPlatforms({ status: "ACTIVE" });
  const { data: campaigns } = useAdCampaigns({
    businessUnitId: filters.businessUnitId,
    platformId: filters.platformId,
  });

  // Analytics queries
  const { data: summary, isLoading: loadingSummary } = useAdsSummary(filters);
  const { data: daily, isLoading: loadingDaily } =
    useAdsDailyPerformance(filters);
  const { data: monthly, isLoading: loadingMonthly } = useAdsMonthlyPerformance(
    {
      businessUnitId: filters.businessUnitId,
      platformId: filters.platformId,
      campaignId: filters.campaignId,
      year: filters.year || new Date().getFullYear(),
    },
  );
  const { data: products, isLoading: loadingProducts } =
    useAdsProductPerformance(filters);
  const { data: platformsPerf, isLoading: loadingPlatforms } =
    useAdsPlatformPerformance(filters);
  const { data: campaignsPerf, isLoading: loadingCampaigns } =
    useAdsCampaignPerformance(filters);

  if (!isOwnerOrFinance) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-sm">
        <p className="text-slate-500">
          Anda tidak memiliki akses ke halaman ini.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Performance Analytics"
        description="Analisa performa Iklan dan Penjualan"
      />

      {/* Global Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-wrap gap-3 items-center">
        <span className="text-sm font-bold text-slate-700 mr-2">Filters:</span>
        
        <SearchableSelect
          value={datePreset}
          onChange={(e) => handlePresetChange(e.target.value as any)}
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="today">Hari Ini</option>
          <option value="this_week">Minggu Ini</option>
          <option value="this_month">Bulan Ini</option>
          <option value="custom">Custom</option>
        </SearchableSelect>

        {datePreset === "custom" && (
          <>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value, month: "", year: "" })}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              title="Mulai Tanggal"
            />
            <span className="text-slate-400 text-sm">-</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value, month: "", year: "" })}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              title="Sampai Tanggal"
            />
          </>
        )}

        <div className="h-6 w-px bg-slate-200 mx-1"></div>
        <SearchableSelect
          value={filters.businessUnitId}
          onChange={(e) =>
            setFilters({
              ...filters,
              businessUnitId: e.target.value,
              campaignId: "",
            })
          }
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Semua Business Unit</option>
          {businessUnits?.map((bu) => (
            <option key={bu.id} value={bu.id}>
              {bu.name}
            </option>
          ))}
        </SearchableSelect>
        <SearchableSelect
          value={filters.platformId}
          onChange={(e) =>
            setFilters({
              ...filters,
              platformId: e.target.value,
              campaignId: "",
            })
          }
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Semua Platform</option>
          {platforms?.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </SearchableSelect>
        <SearchableSelect
          value={filters.campaignId}
          onChange={(e) =>
            setFilters({ ...filters, campaignId: e.target.value })
          }
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Semua Campaign</option>
          {campaigns?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </SearchableSelect>
      </div>

      <AdsSummaryCards data={summary} loading={loadingSummary} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdsDailyTrendChart data={daily} loading={loadingDaily} />
        <AdsMonthlyTrendChart data={monthly} loading={loadingMonthly} />
      </div>

      <AdsProductPerformanceTable data={products} loading={loadingProducts} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdsPlatformPerformanceTable
          data={platformsPerf}
          loading={loadingPlatforms}
        />
        <AdsCampaignPerformanceTable
          data={campaignsPerf}
          loading={loadingCampaigns}
        />
      </div>
    </div>
  );
}
