"use client";

import { PageHeader } from "@/components/ui/page-header";
import { StockOpnameForm } from "@/features/stock-opnames/components/stock-opname-form";
import { InstructionModal } from "@/features/stock-opnames/components/modals/instruction-modal";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/use-translation";

export default function CreateStockOpnamePage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const router = useRouter();
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);

  // STAFF_INPUT cannot create session
  useEffect(() => {
    if (user?.role === "STAFF_INPUT") {
      router.replace("/dashboard/stock-opnames");
    }
  }, [user, router]);

  if (user?.role === "STAFF_INPUT") {
    return null; // Will redirect
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("features.stockOpnames.create.title")}
        description={t("features.stockOpnames.create.subtitle")}
        backHref="/dashboard/stock-opnames"
      >
        <Button 
          variant="outline" 
          className="gap-2 text-slate-600 bg-white"
          onClick={() => setIsInstructionOpen(true)}
        >
          <HelpCircle className="w-4 h-4" />
          {t("features.stockOpnames.instruction")}
        </Button>
      </PageHeader>

      <div className="pb-20">
        <StockOpnameForm />
      </div>

      <InstructionModal 
        isOpen={isInstructionOpen} 
        onClose={() => setIsInstructionOpen(false)} 
      />
    </div>
  );
}
