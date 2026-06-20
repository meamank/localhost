import type { Expense } from "../store/financeStore";

export const FINANCE_TOOLS = [
  {
    name: "log_expense",
    description:
      "Save a new single expense the user mentions (a purchase, bill, or payment) to their finance log.",
    parameters: {
      type: "dict",
      properties: {
        amount: { type: "number", description: "The monetary amount spent." },
        currency: { type: "string", description: 'Currency code, e.g. "INR", "USD". Defaults to INR.' },
        category: { type: "string", description: 'Spending category: "food", "transport", "shopping", "bills", "entertainment", "health", "education", "other".' },
        merchant: { type: "string", description: "Name of the merchant, store, or service." },
        note: { type: "string", description: "Any additional details." },
        date: { type: "string", description: 'Date in YYYY-MM-DD. Defaults to today.' },
      },
      required: ["amount"],
    },
  },
  {
    name: "query_expenses",
    description:
      "Look up previously logged expenses to answer questions about spending. ALWAYS call this when the user asks about past expenses.",
    parameters: {
      type: "dict",
      properties: {
        timeframe: { type: "string", description: "The time period to query: 'today', 'current_month', 'current_year', or 'all_time'." },
        category: { type: "string", description: "Filter by spending category (e.g. 'food', 'transport')." },
        merchant: { type: "string", description: "Filter by merchant name." }
      },
      required: ["timeframe"],
    },
  },
  {
    name: "get_spending_summary",
    description: "Get a breakdown of all spending by category for a given period. Use when the user asks for a summary or breakdown.",
    parameters: {
      type: "dict",
      properties: {
        timeframe: { type: "string", description: "The time period to query: 'today', 'current_month', 'current_year', or 'all_time'." }
      },
      required: ["timeframe"],
    },
  }
];

export function createFinanceToolHandler({
  addExpense,
  queryExpenses,
  getSpendingSummary,
}: {
  addExpense: (expense: {
    amount: number;
    currency?: string;
    category?: string;
    merchant?: string;
    note?: string;
    date?: string;
  }) => Promise<Expense>;
  queryExpenses: (filters?: {
    category?: string;
    merchant?: string;
    start_date?: string;
    end_date?: string;
  }) => Promise<Expense[]>;
  getSpendingSummary: (dateRange?: { start: string; end: string }) => Promise<Array<{ category: string; total: number; count: number }>>;
}) {
  return async (call: {
    toolName: string;
    arguments: Record<string, any>;
  }): Promise<string | null> => {
    console.log("[FinanceTool] Dispatching:", call.toolName, call.arguments);

    const getTimeframeDates = (timeframe?: string) => {
      if (!timeframe || timeframe === 'all_time') return { start_date: undefined, end_date: undefined };
      const now = new Date();
      if (timeframe === 'today') {
        const todayStr = now.toISOString().split('T')[0];
        return { start_date: todayStr, end_date: todayStr };
      }
      if (timeframe === 'current_month') {
        const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        return { start_date: start, end_date: end };
      }
      if (timeframe === 'current_year') {
        const start = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
        const end = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
        return { start_date: start, end_date: end };
      }
      return { start_date: undefined, end_date: undefined };
    };

    switch (call.toolName) {
      case "log_expense": {
        try {
          const expense = await addExpense({
            amount: call.arguments.amount,
            currency: call.arguments.currency,
            category: call.arguments.category,
            merchant: call.arguments.merchant,
            note: call.arguments.note,
            date: call.arguments.date,
          });
          return `Expense logged successfully: ₹${expense.amount} for ${expense.merchant || expense.category} on ${expense.date}.`;
        } catch (e) {
          console.error("[FinanceTool] Error logging expense:", e);
          return `Failed to log expense: ${e}`;
        }
      }

      case "query_expenses": {
        try {
          const { start_date, end_date } = getTimeframeDates(call.arguments.timeframe);
          const expenses = await queryExpenses({
            category: call.arguments.category,
            merchant: call.arguments.merchant,
            start_date,
            end_date,
          });
          if (expenses.length === 0) {
            return "No expenses found matching the given filters.";
          }
          const total = expenses.reduce((sum, e) => sum + e.amount, 0);
          return `Found ${expenses.length} transaction(s) totaling ₹${total.toFixed(2)}.`;
        } catch (e) {
          console.error("[FinanceTool] Error querying expenses:", e);
          return `Failed to query expenses: ${e}`;
        }
      }

      case "get_spending_summary": {
        try {
          const { start_date, end_date } = getTimeframeDates(call.arguments.timeframe);
          const summary = await getSpendingSummary({
            start: start_date as string,
            end: end_date as string,
          });
          if (summary.length === 0) {
            return "No spending found for the given period.";
          }
          const breakdown = summary.map(s => `- ${s.category}: ₹${s.total.toFixed(2)} (${s.count} txns)`).join("\\n");
          return `Spending Summary:\\n${breakdown}`;
        } catch (e) {
          console.error("[FinanceTool] Error getting summary:", e);
          return `Failed to get spending summary: ${e}`;
        }
      }

      default:
        console.warn("[FinanceTool] Unknown tool:", call.toolName);
        return null;
    }
  };
}
