import { useState } from "react";
import { useDashboardStore } from "../store/dashboard-store";
import { useAccounts } from "../../accounts/hooks/use-accounts";
import { useCategories } from "../../categories/hooks/use-categories";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Calendar, FilterX, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { SearchableSelect } from "@/components/ui/searchable-select";

export function DashboardFilterBar() {
  const { filters, setFilter, resetFilters } = useDashboardStore();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // These hooks from other features should fetch limit=100 & status=ACTIVE
  const { data: accounts, businessUnits } = useAccounts();
  const { data: categories } = useCategories();

  const handleReset = () => {
    resetFilters();
  };

  const years = [2024, 2025, 2026, 2027];
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

  return (
    <Card className="relative z-20 border-slate-200 shadow-sm mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end gap-4">
            
            <div className="w-full sm:w-40 space-y-1.5">
              <Label className="text-xs text-slate-500">Year</Label>
              <SearchableSelect
                className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                value={filters.year}
                onChange={(e) => setFilter("year", e.target.value)}
              >
                <option value="">All Time</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </SearchableSelect>
            </div>

            <div className="w-full sm:w-40 space-y-1.5">
              <Label className="text-xs text-slate-500">Month</Label>
              <SearchableSelect
                className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                value={filters.month}
                onChange={(e) => setFilter("month", e.target.value)}
                disabled={!filters.year}
              >
                <option value="">All Months</option>
                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </SearchableSelect>
            </div>

            <Button
              variant="outline"
              className="h-11"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {isExpanded ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
            </Button>

            <Button 
              variant="ghost" 
              onClick={handleReset}
              className="h-11 px-3 text-slate-500 hover:text-red-600 hover:bg-red-50 shrink-0"
              title="Reset Filters"
            >
              <FilterX className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          {isExpanded && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-4 border-t border-slate-100">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">Date From</Label>
                <Input
                  type="date"
                  className="h-11"
                  value={filters.dateFrom}
                  onChange={(e) => setFilter("dateFrom", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">Date To</Label>
                <Input
                  type="date"
                  className="h-11"
                  value={filters.dateTo}
                  onChange={(e) => setFilter("dateTo", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">Business Unit</Label>
                <SearchableSelect
                  className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  value={filters.businessUnitId}
                  onChange={(e) => setFilter("businessUnitId", e.target.value)}
                >
                  <option value="">All Units</option>
                  {businessUnits?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </SearchableSelect>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">Account</Label>
                <SearchableSelect
                  className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  value={filters.accountId}
                  onChange={(e) => setFilter("accountId", e.target.value)}
                >
                  <option value="">All Accounts</option>
                  {accounts?.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </SearchableSelect>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">Category</Label>
                <SearchableSelect
                  className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  value={filters.categoryId}
                  onChange={(e) => setFilter("categoryId", e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </SearchableSelect>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
