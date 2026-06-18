import { useCallback } from "react";
import { financeStore, Expense } from "../store/financeStore";

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

  const queryExpenses = useCallback(
    async (filters?: {
      category?: string;
      start_date?: string;
      end_date?: string;
    }): Promise<Expense[]> => {
      return financeStore.queryExpenses(filters);
    },
    [],
  );

  const deleteExpense = useCallback(async (id: number): Promise<boolean> => {
    return financeStore.deleteExpense(id);
  }, []);

  return { addExpense, queryExpenses, deleteExpense };
}
