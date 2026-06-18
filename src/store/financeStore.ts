import * as SQLite from "expo-sqlite";

export interface Expense {
  id: number;
  amount: number;
  currency: string;
  category: string;
  merchant: string;
  note: string;
  date: string; // ISO date string YYYY-MM-DD
  created_at: string;
}

let db: SQLite.SQLiteDatabase | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync("nirvah_finance.db");
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL,
        currency TEXT NOT NULL DEFAULT 'INR',
        category TEXT NOT NULL DEFAULT 'other',
        merchant TEXT NOT NULL DEFAULT '',
        note TEXT NOT NULL DEFAULT '',
        date TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
  }
  return db;
}

export const financeStore = {
  async addExpense(expense: {
    amount: number;
    currency?: string;
    category?: string;
    merchant?: string;
    note?: string;
    date?: string;
  }): Promise<Expense> {
    const database = await getDb();
    const date = expense.date || new Date().toISOString().split("T")[0];
    const result = await database.runAsync(
      `INSERT INTO expenses (amount, currency, category, merchant, note, date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        expense.amount,
        expense.currency || "INR",
        expense.category || "other",
        expense.merchant || "",
        expense.note || "",
        date,
      ],
    );
    return {
      id: result.lastInsertRowId,
      amount: expense.amount,
      currency: expense.currency || "INR",
      category: expense.category || "other",
      merchant: expense.merchant || "",
      note: expense.note || "",
      date,
      created_at: new Date().toISOString(),
    };
  },

  async queryExpenses(filters?: {
    category?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<Expense[]> {
    const database = await getDb();
    const conditions: string[] = [];
    const params: any[] = [];

    if (filters?.category) {
      conditions.push("category = ?");
      params.push(filters.category);
    }
    if (filters?.start_date) {
      conditions.push("date >= ?");
      params.push(filters.start_date);
    }
    if (filters?.end_date) {
      conditions.push("date <= ?");
      params.push(filters.end_date);
    }

    const where =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const rows = await database.getAllAsync<Expense>(
      `SELECT * FROM expenses ${where} ORDER BY date DESC`,
      params,
    );
    return rows;
  },

  async deleteExpense(id: number): Promise<boolean> {
    const database = await getDb();
    const result = await database.runAsync(
      "DELETE FROM expenses WHERE id = ?",
      [id],
    );
    return result.changes > 0;
  },
};
