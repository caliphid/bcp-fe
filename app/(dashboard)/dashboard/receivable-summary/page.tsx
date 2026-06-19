"use client";

import { PageHeader } from "@/components/ui/page-header";
import { useReceivableSummary, useReceivableAgingSummary, useReceivableByParty } from "../../../../features/external-money/hooks/use-receivable-analytics";
import { ReceivableSummaryCards } from "../../../../features/external-money/components/summary/receivable-summary-cards";
import { AgingSummary } from "../../../../features/external-money/components/summary/aging-summary";
import { ReceivableByPartyTable } from "../../../../features/external-money/components/summary/receivable-by-party-table";

export default function ReceivableSummaryPage() {
  const { data: summaryData, loading: summaryLoading } = useReceivableSummary();
  const { data: agingData, loading: agingLoading } = useReceivableAgingSummary();
  const { data: byPartyData, loading: byPartyLoading } = useReceivableByParty();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Ringkasan Uang Eksternal"
        description="Analitik dan wawasan mengenai total sisa tagihan dan umur piutang"
      />

      <ReceivableSummaryCards data={summaryData} loading={summaryLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <AgingSummary data={agingData} loading={agingLoading} />
        </div>
        <div className="lg:col-span-2">
          <ReceivableByPartyTable data={byPartyData} loading={byPartyLoading} />
        </div>
      </div>
    </div>
  );
}
