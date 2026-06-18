"use client";

import { useEffect, useState, useCallback } from "react";
import { transactionsApi } from "../../../../../features/transactions/api";
import { businessUnitsApi } from "../../../../../features/business-units/api";
import { BusinessUnit } from "../../../../../types/master-data";
import { AccountSummary } from "../../../../../types/transaction";
import { TransactionAccountSummary } from "../../../../../features/transactions/components/transaction-account-summary";

export default function AccountBalancesPage() {
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);

  // Filters
  const [buFilter, setBuFilter] = useState("");

  const [accountSummary, setAccountSummary] = useState<AccountSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    businessUnitsApi.getBusinessUnits({ limit: 100, status: "ACTIVE" })
      .then((res) => {
        setBusinessUnits(res.data);
      })
      .catch((err) => console.error("Failed to fetch business units", err));
  }, []);

  const fetchBalances = useCallback(async () => {
    setLoading(true);
    try {
      const res = await transactionsApi.getAccountSummary({
        businessUnitId: buFilter || undefined,
        status: "ACTIVE",
      });
      setAccountSummary(res.data);
    } catch (err) {
      console.error("Failed to fetch account balances", err);
    } finally {
      setLoading(false);
    }
  }, [buFilter]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Account Balances</h1>
          <p className="text-sm text-slate-500 mt-1">
            View current balances for all active accounts.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <select
            className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            value={buFilter}
            onChange={(e) => setBuFilter(e.target.value)}
          >
            <option value="">All Business Units</option>
            {businessUnits.map((bu) => (
              <option key={bu.id} value={bu.id}>{bu.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <TransactionAccountSummary data={accountSummary} isLoading={loading} />
      </div>
    </div>
  );
}
