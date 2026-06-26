import { useState } from "react";
import { Search, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { useTransactionStore } from "../store/transaction-store";
import { TransactionStatus } from "../../../types/enums";
import { BusinessUnit } from "../../../types/business-unit";
import { Account } from "../../../types/account";
import { Category } from "../../../types/category";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useTranslation } from "../../../hooks/use-translation";

interface FilterBarProps {
  isStaffInput: boolean;
  businessUnits: BusinessUnit[];
  accounts: Account[];
  categories: Category[];
}

export function TransactionFilterBar({ isStaffInput, businessUnits, accounts, categories }: FilterBarProps) {
  const { t } = useTranslation();
  const { filters, setFilter, setFilters, resetFilters } = useTransactionStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearch = () => {
    setFilters({ search: filters.searchInput, page: 1 });
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-1 gap-2">
          <Input
            placeholder={t("features.transactions.filterBar.searchPh")}
            value={filters.searchInput}
            onChange={(e) => {
              setFilters({ 
                searchInput: e.target.value, 
                search: e.target.value, 
                page: 1 
              });
            }}
          />
          <Button type="button" variant="outline" size="icon" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-1 gap-2">
          {!isStaffInput && (
            <div className="flex-1">
              <SearchableSelect
                className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                value={filters.status}
                onChange={(e) => {
                  setFilters({ status: e.target.value, page: 1 });
                }}
              >
                <option value="">{t("features.transactions.filterBar.allStatus")}</option>
                <option value="POSTED">POSTED</option>
                <option value="VOID">VOID</option>
              </SearchableSelect>
            </div>
          )}

          <Button
            variant="outline"
            className="h-11"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {isExpanded ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SearchableSelect
              className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              value={filters.type}
              onChange={(e) => {
                setFilters({ type: e.target.value, page: 1 });
              }}
            >
              <option value="">{t("features.transactions.filterBar.allTypes")}</option>
              <option value="IN">IN</option>
              <option value="OUT">OUT</option>
            </SearchableSelect>

            <SearchableSelect
              className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              value={filters.businessUnitId}
              onChange={(e) => {
                setFilters({ businessUnitId: e.target.value, page: 1 });
              }}
            >
              <option value="">{t("features.transactions.filterBar.allBusinessUnits")}</option>
              {businessUnits.map((bu) => (
                <option key={bu.id} value={bu.id}>{bu.name}</option>
              ))}
            </SearchableSelect>
            
            <SearchableSelect
              className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              value={filters.accountId}
              onChange={(e) => {
                setFilters({ accountId: e.target.value, page: 1 });
              }}
            >
              <option value="">{t("features.transactions.filterBar.allAccounts")}</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </SearchableSelect>

            <SearchableSelect
              className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              value={filters.categoryId}
              onChange={(e) => {
                setFilters({ categoryId: e.target.value, page: 1 });
              }}
            >
              <option value="">{t("features.transactions.filterBar.allCategories")}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </SearchableSelect>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex gap-2">
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => {
                  setFilters({ dateFrom: e.target.value, page: 1 });
                }}
                placeholder="From Date"
              />
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => {
                  setFilters({ dateTo: e.target.value, page: 1 });
                }}
                placeholder="To Date"
              />
            </div>

            <SearchableSelect
              className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              value={filters.sortBy}
              onChange={(e) => { setFilters({ sortBy: e.target.value, page: 1 }); }}
            >
              <option value="transactionDate">{t("features.transactions.filterBar.sortByDate")}</option>
              <option value="amount">{t("features.transactions.filterBar.sortByAmount")}</option>
              <option value="type">{t("features.transactions.filterBar.sortByType")}</option>
              <option value="status">{t("features.transactions.filterBar.sortByStatus")}</option>
              <option value="createdAt">{t("features.transactions.filterBar.sortByCreatedAt")}</option>
              <option value="updatedAt">{t("features.transactions.filterBar.sortByUpdatedAt")}</option>
            </SearchableSelect>
            <SearchableSelect
              className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              value={filters.sortOrder}
              onChange={(e) => { setFilters({ sortOrder: e.target.value, page: 1 }); }}
            >
              <option value="desc">{t("features.transactions.filterBar.descending")}</option>
              <option value="asc">{t("features.transactions.filterBar.ascending")}</option>
            </SearchableSelect>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="w-full h-11"
                onClick={() => resetFilters(isStaffInput)}
              >
                {t("features.transactions.filterBar.resetFilter")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
