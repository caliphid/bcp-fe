import { useDashboardStore } from "../store/dashboard-store";
import { useAccounts } from "../../accounts/hooks/use-accounts";
import { useCategories } from "../../categories/hooks/use-categories";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Calendar, FilterX } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";

export function DashboardFilterBar() {
  const { filters, setFilter, resetFilters } = useDashboardStore();
  
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
        <div className="flex flex-col xl:flex-row gap-4 items-end">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 flex-1 w-full">
            
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">Year</Label>
              <select
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                value={filters.year}
                onChange={(e) => setFilter("year", e.target.value)}
              >
                <option value="">All Time</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">Month</Label>
              <select
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                value={filters.month}
                onChange={(e) => setFilter("month", e.target.value)}
                disabled={!filters.year}
              >
                <option value="">All Months</option>
                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">Date From</Label>
              <Input
                type="date"
                className="h-9"
                value={filters.dateFrom}
                onChange={(e) => setFilter("dateFrom", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">Date To</Label>
              <Input
                type="date"
                className="h-9"
                value={filters.dateTo}
                onChange={(e) => setFilter("dateTo", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">Business Unit</Label>
              <select
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                value={filters.businessUnitId}
                onChange={(e) => setFilter("businessUnitId", e.target.value)}
              >
                <option value="">All Units</option>
                {businessUnits?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">Account</Label>
              <select
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                value={filters.accountId}
                onChange={(e) => setFilter("accountId", e.target.value)}
              >
                <option value="">All Accounts</option>
                {accounts?.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">Category</Label>
              <select
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                value={filters.categoryId}
                onChange={(e) => setFilter("categoryId", e.target.value)}
              >
                <option value="">All Categories</option>
                {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            
          </div>

          <Button 
            variant="ghost" 
            onClick={handleReset}
            className="h-9 px-3 text-slate-500 hover:text-red-600 hover:bg-red-50 shrink-0"
            title="Reset Filters"
          >
            <FilterX className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
