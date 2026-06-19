import { Search } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { useTransactionStore } from "../store/transaction-store";
import { TransactionStatus } from "../../../types/enums";
import { BusinessUnit } from "../../../types/business-unit";
import { Account } from "../../../types/account";
import { Category } from "../../../types/category";
import { SearchableSelect } from "@/components/ui/searchable-select";

interface FilterBarProps {
  isStaffInput: boolean;
  businessUnits: BusinessUnit[];
  accounts: Account[];
  categories: Category[];
}

export function TransactionFilterBar({ isStaffInput, businessUnits, accounts, categories }: FilterBarProps) {
  const { filters, setFilter, resetFilters } = useTransactionStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter("page", 1);
    setFilter("search", filters.searchInput);
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <form onSubmit={handleSearch} className="flex gap-2 lg:col-span-1">
          <Input
            placeholder="Search code or desc..."
            value={filters.searchInput}
            onChange={(e) => setFilter("searchInput", e.target.value)}
          />
          <Button type="submit" variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        {!isStaffInput && (
          <SearchableSelect
            className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            value={filters.status}
            onChange={(e) => {
              setFilter("status", e.target.value);
              setFilter("page", 1);
            }}
          >
            <option value="">All Status</option>
            <option value="POSTED">POSTED</option>
            <option value="VOID">VOID</option>
          </SearchableSelect>
        )}

        <SearchableSelect
          className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          value={filters.type}
          onChange={(e) => {
            setFilter("type", e.target.value);
            setFilter("page", 1);
          }}
        >
          <option value="">All Types</option>
          <option value="IN">IN</option>
          <option value="OUT">OUT</option>
        </SearchableSelect>

        <SearchableSelect
          className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          value={filters.businessUnitId}
          onChange={(e) => {
            setFilter("businessUnitId", e.target.value);
            setFilter("page", 1);
          }}
        >
          <option value="">All Business Units</option>
          {businessUnits.map((bu) => (
            <option key={bu.id} value={bu.id}>{bu.name}</option>
          ))}
        </SearchableSelect>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SearchableSelect
          className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          value={filters.accountId}
          onChange={(e) => {
            setFilter("accountId", e.target.value);
            setFilter("page", 1);
          }}
        >
          <option value="">All Accounts</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>{acc.name}</option>
          ))}
        </SearchableSelect>

        <SearchableSelect
          className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          value={filters.categoryId}
          onChange={(e) => {
            setFilter("categoryId", e.target.value);
            setFilter("page", 1);
          }}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </SearchableSelect>

        <div className="flex gap-2">
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => {
              setFilter("dateFrom", e.target.value);
              setFilter("page", 1);
            }}
            placeholder="From Date"
          />
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => {
              setFilter("dateTo", e.target.value);
              setFilter("page", 1);
            }}
            placeholder="To Date"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => resetFilters(isStaffInput)}
          >
            Reset Filter
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
        <SearchableSelect
          className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          value={filters.sortBy}
          onChange={(e) => { setFilter("sortBy", e.target.value); setFilter("page", 1); }}
        >
          <option value="transactionDate">Sort By Date</option>
          <option value="amount">Sort By Amount</option>
          <option value="type">Sort By Type</option>
          <option value="status">Sort By Status</option>
          <option value="createdAt">Sort By Created At</option>
          <option value="updatedAt">Sort By Updated At</option>
        </SearchableSelect>
        <SearchableSelect
          className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          value={filters.sortOrder}
          onChange={(e) => { setFilter("sortOrder", e.target.value); setFilter("page", 1); }}
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </SearchableSelect>
      </div>
    </div>
  );
}
