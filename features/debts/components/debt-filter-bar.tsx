import { useDebtStore } from "../store/debt-store";
import { useAuthStore } from "../../../store/auth-store";
import { useBusinessUnits } from "../../business-units/hooks/use-business-units";
import { Card, CardContent } from "../../../components/ui/card";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { FilterX } from "lucide-react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useTranslation } from "../../../hooks/use-translation";

export function DebtFilterBar() {
  const { t } = useTranslation();
  const { filters, setFilter, resetFilters } = useDebtStore();
  const user = useAuthStore((s) => s.user);
  
  // Using limit 100 for master data
  const { data: businessUnits } = useBusinessUnits();

  const handleReset = () => {
    resetFilters();
  };

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "ACTIVE", label: "Active" },
    { value: "PAID_OFF", label: "Paid Off" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "DEFAULTED", label: "Defaulted" },
  ];

  const filteredStatusOptions = user?.role === "STAFF_INPUT"
    ? statusOptions.filter(o => o.value === "" || o.value === "ACTIVE" || o.value === "PAID_OFF")
    : statusOptions;

  const typeOptions = [
    { value: "", label: "All Types" },
    { value: "BANK_LOAN", label: "Bank Loan" },
    { value: "PERSONAL_LOAN", label: "Personal Loan" },
    { value: "BUSINESS_CAPITAL", label: "Business Capital" },
    { value: "ASSET_PURCHASE", label: "Asset Purchase" },
    { value: "CREDIT_CARD", label: "Credit Card" },
    { value: "PAYABLE", label: "Payable" },
    { value: "OTHER", label: "Other" },
  ];

  return (
    <Card className="relative z-20 border-slate-200 shadow-sm mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col xl:flex-row gap-4 items-end">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 flex-1 w-full">
            
            <div className="space-y-1.5 lg:col-span-2">
              <Label className="text-xs text-slate-500 mb-1.5 block">{t("features.debts.filterBar.searchLabel")}</Label>
              <Input
                placeholder={t("features.debts.filterBar.searchPh")}
                className="h-9"
                value={filters.search}
                onChange={(e) => setFilter("search", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 mb-1.5 block">{t("features.debts.filterBar.statusLabel")}</Label>
              <SearchableSelect
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                value={filters.status || ""}
                onChange={(e) => setFilter("status", e.target.value as any)}
              >
                <option value="">{t("features.debts.filterBar.allStatus")}</option>
                <option value="ACTIVE">{t("features.debts.filterBar.statusActive")}</option>
                <option value="PAID_OFF">{t("features.debts.filterBar.statusPaidOff")}</option>
                {user?.role !== "STAFF_INPUT" && (
                  <>
                    <option value="INACTIVE">{t("features.debts.filterBar.statusInactive")}</option>
                    <option value="DEFAULTED">{t("features.debts.filterBar.statusDefaulted")}</option>
                  </>
                )}
              </SearchableSelect>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 mb-1.5 block">{t("features.debts.filterBar.typeLabel")}</Label>
              <SearchableSelect
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                value={filters.type || ""}
                onChange={(e) => setFilter("type", e.target.value as any)}
              >
                <option value="">{t("features.debts.filterBar.allTypes")}</option>
                <option value="BANK_LOAN">{t("features.debts.filterBar.typeBankLoan")}</option>
                <option value="PERSONAL_LOAN">{t("features.debts.filterBar.typePersonalLoan")}</option>
                <option value="BUSINESS_CAPITAL">{t("features.debts.filterBar.typeBusinessCapital")}</option>
                <option value="ASSET_PURCHASE">{t("features.debts.filterBar.typeAssetPurchase")}</option>
                <option value="CREDIT_CARD">{t("features.debts.filterBar.typeCreditCard")}</option>
                <option value="PAYABLE">{t("features.debts.filterBar.typePayable")}</option>
                <option value="OTHER">{t("features.debts.filterBar.typeOther")}</option>
              </SearchableSelect>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 mb-1.5 block">{t("features.debts.filterBar.businessUnitLabel")}</Label>
              <SearchableSelect
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                value={filters.businessUnitId}
                onChange={(e) => setFilter("businessUnitId", e.target.value)}
              >
                <option value="">{t("features.debts.filterBar.allBusinessUnits")}</option>
                {businessUnits?.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </SearchableSelect>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 mb-1.5 block">{t("features.debts.filterBar.lenderNameLabel")}</Label>
              <Input
                placeholder={t("features.debts.filterBar.lenderNamePh")}
                className="h-9"
                value={filters.lenderName}
                onChange={(e) => setFilter("lenderName", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 mb-1.5 block">{t("features.debts.filterBar.dateFromLabel")}</Label>
              <div className="relative">
                <Input
                  type="date"
                  className="h-9"
                  value={filters.dateFrom}
                  onChange={(e) => setFilter("dateFrom", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 mb-1.5 block">{t("features.debts.filterBar.dateToLabel")}</Label>
              <div className="relative">
                <Input
                  type="date"
                  className="h-9"
                  value={filters.dateTo}
                  onChange={(e) => setFilter("dateTo", e.target.value)}
                />
              </div>
            </div>

          </div>

          <Button 
            variant="ghost" 
            onClick={handleReset}
            className="h-9 px-3 text-slate-500 hover:text-red-600 hover:bg-red-50 shrink-0"
            title={t("features.debts.filterBar.resetFilter")}
          >
            <FilterX className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
