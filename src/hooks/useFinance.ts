import { useCallback } from "react";
import { financeStore, Expense } from "../store/financeStore";
import { ParsedTransaction } from "../constants/statementParser";

export function useFinance() {
  const addExpense = useCallback(
    async (expense: {
      amount: number;
      currency?: string;
      category?: string;
      merchant?: string;
      note?: string;
      date?: string;
    }): Promise<Expense> => {
      return financeStore.addExpense(expense);
    },
    [],
  );

  const addMultipleExpenses = useCallback(
    async (expenses: Array<{
      amount: number;
      currency?: string;
      category?: string;
      merchant?: string;
      note?: string;
      date?: string;
    }>): Promise<Expense[]> => {
      return financeStore.addMultipleExpenses(expenses);
    },
    [],
  );

  const bulkInsertFromStatement = useCallback(
    async (transactions: ParsedTransaction[]) => {
      return financeStore.bulkInsertFromStatement(transactions);
    },
    [],
  );

  const queryExpenses = useCallback(
    async (filters?: {
      category?: string;
      merchant?: string;
      start_date?: string;
      end_date?: string;
    }): Promise<Expense[]> => {
      return financeStore.queryExpenses(filters);
    },
    [],
  );

  const queryByMerchant = useCallback(
    async (merchant: string, dateRange?: { start: string; end: string }) => {
      return financeStore.queryByMerchant(merchant, dateRange);
    },
    [],
  );

  const getSpendingSummary = useCallback(
    async (dateRange?: { start: string; end: string }) => {
      return financeStore.getSpendingSummary(dateRange);
    },
    [],
  );

  const deleteExpense = useCallback(async (id: number): Promise<boolean> => {
    return financeStore.deleteExpense(id);
  }, []);

  const clearAllData = useCallback(async () => {
    try {
      await financeStore.clearAllData();
      return true;
    } catch (e) {
      console.error("Failed to clear data", e);
      return false;
    }
  }, []);

  return {
    addExpense,
    addMultipleExpenses,
    bulkInsertFromStatement,
    queryExpenses,
    queryByMerchant,
    getSpendingSummary,
    deleteExpense,
    clearAllData,
  };
}
