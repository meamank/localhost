import type { Expense } from "../store/financeStore";

// Tool definitions following react-native-executorch's LLMTool format
// Note: type must be "dict" (not "object") — the library passes these
// directly into the Jinja chat template which expects Python-style types.
export const FINANCE_TOOLS = [
  {
    name: "log_expense",
    description:
      "Save a new expense the user mentions (a purchase, bill, or payment) to their finance log.",
    parameters: {
      type: "dict",
      properties: {
        amount: {
          type: "number",
          description: "The monetary amount spent.",
        },
        currency: {
          type: "string",
          description:
            'Currency code, e.g. "INR", "USD". Defaults to INR if not specified.',
        },
        category: {
          type: "string",
          description:
            'Spending category: "food", "transport", "shopping", "bills", "entertainment", "health", "education", "other".',
        },
        merchant: {
          type: "string",
          description:
            "Name of the merchant, store, or service where the money was spent.",
        },
        note: {
          type: "string",
          description: "Any additional details about the expense.",
        },
        date: {
          type: "string",
          description:
            'Date of the expense in YYYY-MM-DD format. Defaults to today if not specified.',
        },
      },
      required: ["amount"],
    },
  },
  {
    name: "query_expenses",
    description:
      "Look up previously logged expenses, optionally filtered by category or date range, to answer questions about spending.",
    parameters: {
      type: "dict",
      properties: {
        category: {
          type: "string",
          description: "Filter by spending category.",
        },
        start_date: {
          type: "string",
          description: "Start of date range (YYYY-MM-DD).",
        },
        end_date: {
          type: "string",
          description: "End of date range (YYYY-MM-DD).",
        },
      },
      required: [],
    },
  },
];

/**
 * Creates the executeToolCallback for finance tools.
 * This is called by the library's LLMController when it parses a tool call
 * from the model's output. The return string gets appended to the message
 * history so the model can summarize it in natural language.
 */
export function createFinanceToolHandler({
  addExpense,
  queryExpenses,
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
    start_date?: string;
    end_date?: string;
  }) => Promise<Expense[]>;
}) {
  return async (call: {
    toolName: string;
    arguments: Record<string, any>;
  }): Promise<string | null> => {
    console.log("[FinanceTool] Dispatching:", call.toolName, call.arguments);

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
          const result = `Expense logged successfully: ₹${expense.amount} for ${expense.merchant || expense.category} on ${expense.date}.`;
          console.log("[FinanceTool] Result:", result);
          return result;
        } catch (e) {
          console.error("[FinanceTool] Error logging expense:", e);
          return `Failed to log expense: ${e}`;
        }
      }

      case "query_expenses": {
        try {
          const expenses = await queryExpenses({
            category: call.arguments.category,
            start_date: call.arguments.start_date,
            end_date: call.arguments.end_date,
          });
          if (expenses.length === 0) {
            return "No expenses found matching the given filters.";
          }
          const total = expenses.reduce((sum, e) => sum + e.amount, 0);
          const summary = expenses
            .slice(0, 10)
            .map(
              (e) =>
                `- ₹${e.amount} ${e.merchant ? `at ${e.merchant}` : ""} (${e.category}) on ${e.date}`,
            )
            .join("\n");
          return `Found ${expenses.length} expense(s), total: ₹${total}.\n${summary}${expenses.length > 10 ? `\n...and ${expenses.length - 10} more.` : ""}`;
        } catch (e) {
          console.error("[FinanceTool] Error querying expenses:", e);
          return `Failed to query expenses: ${e}`;
        }
      }

      default:
        console.warn("[FinanceTool] Unknown tool:", call.toolName);
        return null;
    }
  };
}
