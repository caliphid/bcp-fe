import { useState, useCallback, useEffect } from "react";
import { transactionsApi } from "../api";
import { businessUnitsApi } from "../../business-units/api";
import { accountsApi } from "../../accounts/api";
import { categoriesApi } from "../../categories/api";
import { useTransactionStore } from "../store/transaction-store";
import { Transaction, TransactionSummary } from "../../../types/transaction";
import { BusinessUnit } from "../../../types/business-unit";
import { Account } from "../../../types/account";
import { Category } from "../../../types/category";
import { PaginationMeta } from "../../../types/common";
import { extractErrorMessage } from "../../../lib/error";

export function useTransactions() {
  const { filters } = useTransactionStore();
  
  const [data, setData] = useState<Transaction[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [summaryCards, setSummaryCards] = useState<TransactionSummary | null>(null);
  const [loadingSummaries, setLoadingSummaries] = useState(false);

  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    Promise.all([
      businessUnitsApi.getBusinessUnits({ limit: 100, status: "ACTIVE" }),
      accountsApi.getAccounts({ limit: 100, status: "ACTIVE" }),
      categoriesApi.getCategories({ limit: 100, status: "ACTIVE" }),
    ])
      .then(([buRes, accRes, catRes]) => {
        setBusinessUnits(buRes.data);
        setAccounts(accRes.data);
        setCategories(catRes.data);
      })
      .catch((err) => console.error("Failed to fetch master data", err));
  }, []);

  const buildApiFilters = useCallback(() => {
    return {
      page: filters.page,
      limit: 10,
      search: filters.search || undefined,
      status: filters.status || undefined,
      type: filters.type || undefined,
      businessUnitId: filters.businessUnitId || undefined,
      accountId: filters.accountId || undefined,
      categoryId: filters.categoryId || undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      month: (!filters.dateFrom && !filters.dateTo && filters.month) ? filters.month : undefined,
      year: (!filters.dateFrom && !filters.dateTo && filters.year) ? filters.year : undefined,
      sortBy: filters.sortBy || undefined,
      sortOrder: filters.sortOrder || undefined,
    };
  }, [filters]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const apiFilters = buildApiFilters();
      const res = await transactionsApi.getTransactions(apiFilters);
      setData(res.data);
      setMeta(res.meta);
      setGlobalError(null);
    } catch (err) {
      setGlobalError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [buildApiFilters]);

  const fetchSummaries = useCallback(async () => {
    setLoadingSummaries(true);
    try {
      const sumRes = await transactionsApi.getSummary({
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        month: filters.month || undefined,
        year: filters.year || undefined,
        businessUnitId: filters.businessUnitId || undefined,
        accountId: filters.accountId || undefined,
      });
      setSummaryCards(sumRes.data);
    } catch (err) {
      console.error("Failed to fetch summaries", err);
    } finally {
      setLoadingSummaries(false);
    }
  }, [
    filters.dateFrom,
    filters.dateTo,
    filters.month,
    filters.year,
    filters.businessUnitId,
    filters.accountId,
  ]);

  useEffect(() => {
    fetchData();
    fetchSummaries();
  }, [fetchData, fetchSummaries]);

  return {
    data,
    meta,
    loading,
    globalError,
    setGlobalError,
    summaryCards,
    loadingSummaries,
    businessUnits,
    accounts,
    categories,
    fetchData,
    fetchSummaries,
  };
}
