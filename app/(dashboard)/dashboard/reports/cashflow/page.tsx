"use client";

import { useEffect, useState, useCallback } from "react";
import { transactionsApi } from "../../../../../features/transactions/api";
import { businessUnitsApi } from "../../../../../features/business-units/api";
import { accountsApi } from "../../../../../features/accounts/api";
import { BusinessUnit } from "../../../../../types/business-unit";
import { Account } from "../../../../../types/account";
import { MonthlySummary, CategorySummary } from "../../../../../types/transaction";
import { TransactionMonthlySummary } from "../../../../../features/transactions/components/transaction-monthly-summary";
import { TransactionCategorySummary } from "../../../../../features/transactions/components/transaction-category-summary";
import { SearchableSelect } from "@/components/ui/searchable-select";

export default function CashflowReportsPage() {
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  // Filters
  const [buFilter, setBuFilter] = useState("");
  const [accountFilter, setAccountFilter] = useState("");
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());

  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary[]>([]);
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      businessUnitsApi.getBusinessUnits({ limit: 100, status: "ACTIVE" }),
      accountsApi.getAccounts({ limit: 100, status: "ACTIVE" }),
    ])
      .then(([buRes, accRes]) => {
        setBusinessUnits(buRes.data);
        setAccounts(accRes.data);
      })
      .catch((err) => console.error("Failed to fetch master data", err));
  }, []);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const [monthlyRes, catRes] = await Promise.all([
        transactionsApi.getMonthlySummary({
          year: yearFilter || undefined,
          businessUnitId: buFilter || undefined,
          accountId: accountFilter || undefined,
        }),
        transactionsApi.getCategorySummary({
          year: yearFilter || undefined,
          businessUnitId: buFilter || undefined,
          accountId: accountFilter || undefined,
          limit: 100,
        })
      ]);
      setMonthlySummary(monthlyRes.data);
      setCategorySummary(catRes.data);
    } catch (err) {
      console.error("Failed to fetch reports", err);
    } finally {
      setLoading(false);
    }
  }, [buFilter, accountFilter, yearFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Cashflow Reports</h1>
          <p className="text-sm text-slate-500 mt-1">
            View monthly trends and category breakdown.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SearchableSelect
            className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            value={buFilter}
            onChange={(e) => setBuFilter(e.target.value)}
          >
            <option value="">All Business Units</option>
            {businessUnits.map((bu) => (
              <option key={bu.id} value={bu.id}>{bu.name}</option>
            ))}
          </SearchableSelect>

          <SearchableSelect
            className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
          >
            <option value="">All Accounts</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>{acc.name} ({acc.bankName})</option>
            ))}
          </SearchableSelect>

          <SearchableSelect
            className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y.toString()}>{y}</option>
            ))}
          </SearchableSelect>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TransactionMonthlySummary data={monthlySummary} isLoading={loading} />
        </div>
        <div className="lg:col-span-1">
          <TransactionCategorySummary data={categorySummary} isLoading={loading} />
        </div>
      </div>
    </div>
  );
}
