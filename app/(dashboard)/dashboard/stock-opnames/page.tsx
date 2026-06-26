"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus, ListChecks, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { useStockOpnamesStore } from "@/features/stock-opnames/store/stock-opnames-store";
import { useStockOpnames } from "@/features/stock-opnames/hooks/use-stock-opnames";
import { StockOpnamesTable } from "@/features/stock-opnames/components/stock-opnames-table";
import { StockOpnamesFilterBar } from "@/features/stock-opnames/components/stock-opnames-filter-bar";
import { Pagination } from "@/components/ui/pagination";
import { InstructionModal } from "@/features/stock-opnames/components/modals/instruction-modal";
import { useTranslation } from "@/hooks/use-translation";

export default function StockOpnamesPage() {
  const { user } = useAuthStore();
  const { filters, setFilter } = useStockOpnamesStore();
  const { data, meta, isLoading } = useStockOpnames(filters);
  const { t } = useTranslation();
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);

  // OWNER or ADMIN_FINANCE can create
  const canCreate = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <PageHeader
          title={t("features.stockOpnames.title")}
          description={t("features.stockOpnames.subtitle")}
        />
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="gap-2 text-slate-600 bg-white"
            onClick={() => setIsInstructionOpen(true)}
          >
            <HelpCircle className="w-4 h-4" />
            {t("features.stockOpnames.instruction")}
          </Button>
          {canCreate && (
            <Link href="/dashboard/stock-opnames/create">
              <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                <Plus className="w-4 h-4" />
                {t("features.stockOpnames.newSession")}
              </Button>
            </Link>
          )}
        </div>
      </div>

      <StockOpnamesFilterBar />
      
      <StockOpnamesTable sessions={data || []} isLoading={isLoading} />
      
      {meta && meta.totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            meta={meta}
            onPageChange={(p) => setFilter("page", p)}
          />
        </div>
      )}

      <InstructionModal 
        isOpen={isInstructionOpen} 
        onClose={() => setIsInstructionOpen(false)} 
      />
    </div>
  );
}
