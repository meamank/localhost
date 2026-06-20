import * as SQLite from "expo-sqlite";
import { ParsedTransaction } from "../constants/statementParser";

export interface Expense {
  id: number;
  amount: number;
  currency: string;
  category: string;
  merchant: string;
  note: string;
  date: string; // ISO date string YYYY-MM-DD
  created_at: string;
  type: string;
  card_last4: string;
  bank: string;
  raw_description: string;
  source: string;
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
    
    // Migration for new columns
    const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    const user_version = result?.user_version || 0;
    
    if (user_version < 2) {
      try { await db.execAsync(`ALTER TABLE expenses ADD COLUMN type TEXT NOT NULL DEFAULT 'debit';`); } catch (e) {}
      try { await db.execAsync(`ALTER TABLE expenses ADD COLUMN card_last4 TEXT NOT NULL DEFAULT '';`); } catch (e) {}
      try { await db.execAsync(`ALTER TABLE expenses ADD COLUMN bank TEXT NOT NULL DEFAULT '';`); } catch (e) {}
      try { await db.execAsync(`ALTER TABLE expenses ADD COLUMN raw_description TEXT NOT NULL DEFAULT '';`); } catch (e) {}
      try { await db.execAsync(`ALTER TABLE expenses ADD COLUMN source TEXT NOT NULL DEFAULT 'manual';`); } catch (e) {}
      
      await db.execAsync(`PRAGMA user_version = 2;`);
    }
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
      `INSERT INTO expenses (amount, currency, category, merchant, note, date, type, card_last4, bank, raw_description, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        expense.amount,
        expense.currency || "INR",
        expense.category || "other",
        expense.merchant || "",
        expense.note || "",
        date,
        "debit", // default for manual
        "",
        "",
        "",
        "manual"
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
      type: "debit",
      card_last4: "",
      bank: "",
      raw_description: "",
      source: "manual"
    };
  },

  async addMultipleExpenses(expenses: Array<{
    amount: number;
    currency?: string;
    category?: string;
    merchant?: string;
    note?: string;
    date?: string;
  }>): Promise<Expense[]> {
    if (expenses.length === 0) return [];
    
    const database = await getDb();
    const results: Expense[] = [];
    
    for (const exp of expenses) {
      const date = exp.date || new Date().toISOString().split("T")[0];
      const result = await database.runAsync(
        `INSERT INTO expenses (amount, currency, category, merchant, note, date, type, card_last4, bank, raw_description, source)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          exp.amount,
          exp.currency || "INR",
          exp.category || "other",
          exp.merchant || "",
          exp.note || "",
          date,
          "debit", // default for manual
          "",
          "",
          "",
          "manual"
        ],
      );
      results.push({
        id: result.lastInsertRowId,
        amount: exp.amount,
        currency: exp.currency || "INR",
        category: exp.category || "other",
        merchant: exp.merchant || "",
        note: exp.note || "",
        date,
        created_at: new Date().toISOString(),
        type: "debit",
        card_last4: "",
        bank: "",
        raw_description: "",
        source: "manual"
      });
    }
    
    return results;
  },

  async bulkInsertFromStatement(transactions: ParsedTransaction[]): Promise<{ inserted: number; duplicates: number }> {
    const database = await getDb();
    let inserted = 0;
    let duplicates = 0;
    await database.withTransactionAsync(async () => {
      for (const tx of transactions) {
        const existing = await database.getFirstAsync(
          'SELECT id FROM expenses WHERE amount = ? AND date = ? AND merchant = ? AND type = ?',
          [tx.amount, tx.date, tx.merchant, tx.type]
        );
        if (existing) {
          duplicates++;
          continue;
        }

        await database.runAsync(
          `INSERT INTO expenses (amount, currency, category, merchant, note, date, type, card_last4, bank, raw_description, source)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            tx.amount,
            "INR",
            tx.category,
            tx.merchant,
            "",
            tx.date,
            tx.type,
            tx.cardLast4,
            tx.bank,
            tx.rawDescription,
            "statement"
          ]
        );
        inserted++;
      }
    });
    return { inserted, duplicates };
  },

  async queryExpenses(filters?: {
    category?: string;
    merchant?: string;
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
    if (filters?.merchant) {
      conditions.push("merchant LIKE ?");
      params.push(`%${filters.merchant}%`);
    }
    if (filters?.start_date) {
      conditions.push("date >= ?");
      params.push(filters.start_date);
    }
    if (filters?.end_date) {
      conditions.push("date <= ?");
      params.push(filters.end_date);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    return database.getAllAsync<Expense>(
      `SELECT * FROM expenses ${where} ORDER BY date DESC`,
      params,
    );
  },

  async queryByMerchant(merchant: string, dateRange?: { start: string; end: string }): Promise<Expense[]> {
    const database = await getDb();
    const conditions: string[] = ["merchant LIKE ?"];
    const params: any[] = [`%${merchant}%`];

    if (dateRange?.start) {
      conditions.push("date >= ?");
      params.push(dateRange.start);
    }
    if (dateRange?.end) {
      conditions.push("date <= ?");
      params.push(dateRange.end);
    }

    const where = `WHERE ${conditions.join(" AND ")}`;
    return database.getAllAsync<Expense>(
      `SELECT * FROM expenses ${where} ORDER BY date DESC`,
      params,
    );
  },

  async getSpendingSummary(dateRange?: { start: string; end: string }): Promise<{ category: string; total: number; count: number; }[]> {
    const database = await getDb();
    const conditions: string[] = ["type = 'debit'"];
    const params: any[] = [];

    if (dateRange?.start) {
      conditions.push("date >= ?");
      params.push(dateRange.start);
    }
    if (dateRange?.end) {
      conditions.push("date <= ?");
      params.push(dateRange.end);
    }

    const where = `WHERE ${conditions.join(" AND ")}`;
    
    return database.getAllAsync<{ category: string; total: number; count: number }>(
      `SELECT category, SUM(amount) as total, COUNT(*) as count FROM expenses ${where} GROUP BY category ORDER BY total DESC`,
      params
    );
  },

  async deleteExpense(id: number): Promise<boolean> {
    const database = await getDb();
    const result = await database.runAsync(
      "DELETE FROM expenses WHERE id = ?",
      [id],
    );
    return result.changes > 0;
  },

  async clearAllData(): Promise<void> {
    const database = await getDb();
    await database.execAsync("DELETE FROM expenses;");
  }
};
