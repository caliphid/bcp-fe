import { useState } from "react";
import { useTranslation } from "../../../hooks/use-translation";
import { useOrderDashboardStore } from "../store/order-dashboard-store";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { FilterX, Calendar } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { SearchableSelect } from "../../../components/ui/searchable-select";
import { useBusinessUnits } from "../../business-units/hooks/use-business-units";

export function OrderDashboardFilterBar() {
  const { t } = useTranslation();
  const { filters, setFilter, setFilters, resetFilters } = useOrderDashboardStore();
  const { data: businessUnitsData } = useBusinessUnits();
  
  // Local state to toggle between Month/Year mode and Custom Date mode
  const [isCustomMode, setIsCustomMode] = useState(false);

  const handleReset = () => {
    resetFilters();
    setIsCustomMode(false);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const handleModeToggle = () => {
    if (isCustomMode) {
      // Switch back to Month/Year mode
      setIsCustomMode(false);
      setFilters({
        dateFrom: undefined,
        dateTo: undefined,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      });
    } else {
      // Switch to Custom Range mode
      setIsCustomMode(true);
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      
      setFilters({
        month: undefined,
        year: undefined,
        dateFrom: firstDay.toISOString().split("T")[0],
        dateTo: today.toISOString().split("T")[0],
      });
    }
  };

  return (
    <Card className="relative z-20 border-slate-200 shadow-sm mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end gap-4">
            
            <div className="flex items-center h-11 px-3 border border-slate-200 rounded-xl bg-slate-50 gap-2 cursor-pointer shrink-0" onClick={handleModeToggle}>
              <Calendar className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">
                {isCustomMode ? t("orderDashboard.filterBar.customDateRange") : t("orderDashboard.filterBar.monthlyPeriod")}
              </span>
              <span className="text-xs text-indigo-600 font-semibold ml-2 underline">{t("orderDashboard.filterBar.switch")}</span>
            </div>

            {!isCustomMode ? (
              <>
                <div className="w-full sm:w-40 space-y-1.5">
                  <Label className="text-xs text-slate-500">{t("orderDashboard.filterBar.year")}</Label>
                  <SearchableSelect
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    value={filters.year || ""}
                    onChange={(e) => setFilter("year", Number(e.target.value) || undefined)}
                  >
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </SearchableSelect>
                </div>

                <div className="w-full sm:w-40 space-y-1.5">
                  <Label className="text-xs text-slate-500">{t("orderDashboard.filterBar.month")}</Label>
                  <SearchableSelect
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    value={filters.month || ""}
                    onChange={(e) => setFilter("month", Number(e.target.value) || undefined)}
                    disabled={!filters.year}
                  >
                    {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </SearchableSelect>
                </div>
              </>
            ) : (
              <>
                <div className="w-full sm:w-40 space-y-1.5">
                  <Label className="text-xs text-slate-500">{t("orderDashboard.filterBar.dateFrom")}</Label>
                  <Input
                    type="date"
                    className="h-11 rounded-xl border-slate-200"
                    value={filters.dateFrom || ""}
                    onChange={(e) => setFilter("dateFrom", e.target.value)}
                  />
                </div>
                <div className="w-full sm:w-40 space-y-1.5">
                  <Label className="text-xs text-slate-500">{t("orderDashboard.filterBar.dateTo")}</Label>
                  <Input
                    type="date"
                    className="h-11 rounded-xl border-slate-200"
                    value={filters.dateTo || ""}
                    onChange={(e) => setFilter("dateTo", e.target.value)}
                    min={filters.dateFrom}
                  />
                </div>
              </>
            )}

            <div className="w-full sm:w-48 space-y-1.5">
              <Label className="text-xs text-slate-500">{t("orderDashboard.filterBar.businessUnit")}</Label>
              <SearchableSelect
                className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                value={filters.businessUnitId || ""}
                onChange={(e) => setFilter("businessUnitId", e.target.value || undefined)}
              >
                <option value="">{t("orderDashboard.filterBar.allUnits")}</option>
                {businessUnitsData?.data?.map(bu => (
                  <option key={bu.id} value={bu.id}>{bu.name}</option>
                ))}
              </SearchableSelect>
            </div>

            <Button 
              variant="ghost" 
              onClick={handleReset}
              className="h-11 px-3 text-slate-500 hover:text-red-600 hover:bg-red-50 shrink-0 ml-auto"
              title={t("orderDashboard.filterBar.resetFilters")}
            >
              <FilterX className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
