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

export interface StatementMetadata {
  id?: number;
  card_last4: string;
  bank: string;
  billing_period: string;
  due_date: string;
  total_due: number;
  is_paid?: boolean;
  created_at?: string;
}

export interface RecurringObligation {
  id?: number;
  type: "emi" | "subscription" | "bill";
  merchant: string;
  amount: number;
  frequency: "monthly" | "yearly";
  start_date: string;
  end_date?: string;
  next_due_date: string;
  card_last4: string;
  status: "active" | "completed" | "cancelled";
  total_installments?: number;
  pending_installments?: number;
  outstanding_principal?: number;
  created_at?: string;
}

let db: SQLite.SQLiteDatabase | null = null;
// Shared in-flight init promise so concurrent callers await the SAME
// initialization instead of racing to open/migrate the db independently.
let dbInitPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function initDb(): Promise<SQLite.SQLiteDatabase> {
  console.log("[financeStore] Opening database...");
  const database = await SQLite.openDatabaseAsync("nirvah_finance.db");

  console.log("[financeStore] Ensuring expenses table...");
  await database.execAsync(`
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
  const result = await database.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  const user_version = result?.user_version || 0;
  console.log("[financeStore] Current user_version:", user_version);

  if (user_version < 2) {
    console.log("[financeStore] Migrating to v2 (adding columns)...");
    try {
      await database.execAsync(
        `ALTER TABLE expenses ADD COLUMN type TEXT NOT NULL DEFAULT 'debit';`,
      );
    } catch (e) {
      console.log("[financeStore] migration 'type' skipped:", e);
    }
    try {
      await database.execAsync(
        `ALTER TABLE expenses ADD COLUMN card_last4 TEXT NOT NULL DEFAULT '';`,
      );
    } catch (e) {
      console.log("[financeStore] migration 'card_last4' skipped:", e);
    }
    try {
      await database.execAsync(
        `ALTER TABLE expenses ADD COLUMN bank TEXT NOT NULL DEFAULT '';`,
      );
    } catch (e) {
      console.log("[financeStore] migration 'bank' skipped:", e);
    }
    try {
      await database.execAsync(
        `ALTER TABLE expenses ADD COLUMN raw_description TEXT NOT NULL DEFAULT '';`,
      );
    } catch (e) {
      console.log("[financeStore] migration 'raw_description' skipped:", e);
    }
    try {
      await database.execAsync(
        `ALTER TABLE expenses ADD COLUMN source TEXT NOT NULL DEFAULT 'manual';`,
      );
    } catch (e) {
      console.log("[financeStore] migration 'source' skipped:", e);
    }

    await database.execAsync(`PRAGMA user_version = 2;`);
  }

  console.log("[financeStore] Ensuring statements table...");
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS statements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      card_last4 TEXT NOT NULL,
      bank TEXT NOT NULL,
      billing_period TEXT,
      due_date TEXT,
      total_due REAL,
      is_paid BOOLEAN NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  if (user_version < 3) {
    await database.execAsync(`PRAGMA user_version = 3;`);
  }
  
  if (user_version < 5) {
    console.log("[financeStore] Migrating to v5 (adding is_paid to statements)...");
    try {
      await database.execAsync(
        `ALTER TABLE statements ADD COLUMN is_paid BOOLEAN NOT NULL DEFAULT 0;`,
      );
    } catch (e) {
      console.log("[financeStore] migration 'is_paid' skipped:", e);
    }
    await database.execAsync(`PRAGMA user_version = 5;`);
  }

  console.log("[financeStore] Ensuring recurring_obligations table...");
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS recurring_obligations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      merchant TEXT NOT NULL,
      amount REAL NOT NULL,
      frequency TEXT NOT NULL DEFAULT 'monthly',
      start_date TEXT NOT NULL,
      end_date TEXT,
      next_due_date TEXT NOT NULL,
      card_last4 TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'active',
      total_installments INTEGER,
      pending_installments INTEGER,
      outstanding_principal REAL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  if (user_version < 4) {
    await database.execAsync(`PRAGMA user_version = 4;`);
  }

  console.log("[financeStore] Database ready.");
  return database;
}

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  // If init is already in flight, piggyback on it instead of starting a
  // second openDatabaseAsync()/migration sequence against the same file.
  if (!dbInitPromise) {
    dbInitPromise = initDb()
      .then((database) => {
        db = database;
        return database;
      })
      .catch((e) => {
        console.error("[financeStore] Database initialization failed:", e);
        // Reset so the NEXT call retries from scratch instead of being
        // permanently stuck with a half-initialized/never-set handle.
        dbInitPromise = null;
        throw e;
      });
  }

  return dbInitPromise;
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
        (expense.category || "other").trim().toLowerCase(),
        expense.merchant || "",
        expense.note || "",
        date,
        "debit", // default for manual
        "",
        "",
        "",
        "manual",
      ],
    );
    return {
      id: result.lastInsertRowId,
      amount: expense.amount,
      currency: expense.currency || "INR",
      category: (expense.category || "other").trim().toLowerCase(),
      merchant: expense.merchant || "",
      note: expense.note || "",
      date,
      created_at: new Date().toISOString(),
      type: "debit",
      card_last4: "",
      bank: "",
      raw_description: "",
      source: "manual",
    };
  },

  async addMultipleExpenses(
    expenses: Array<{
      amount: number;
      currency?: string;
      category?: string;
      merchant?: string;
      note?: string;
      date?: string;
    }>,
  ): Promise<Expense[]> {
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
          (exp.category || "other").trim().toLowerCase(),
          exp.merchant || "",
          exp.note || "",
          date,
          "debit", // default for manual
          "",
          "",
          "",
          "manual",
        ],
      );
      results.push({
        id: result.lastInsertRowId,
        amount: exp.amount,
        currency: exp.currency || "INR",
        category: (exp.category || "other").trim().toLowerCase(),
        merchant: exp.merchant || "",
        note: exp.note || "",
        date,
        created_at: new Date().toISOString(),
        type: "debit",
        card_last4: "",
        bank: "",
        raw_description: "",
        source: "manual",
      });
    }

    return results;
  },

  async bulkInsertFromStatement(
    transactions: ParsedTransaction[],
    metadata?: Omit<StatementMetadata, "id" | "created_at">,
  ): Promise<{ inserted: number; duplicates: number }> {
    let database: SQLite.SQLiteDatabase;
    try {
      database = await getDb();
    } catch (e) {
      console.error(
        "[financeStore] bulkInsertFromStatement: failed to open database:",
        e,
      );
      throw e;
    }

    let inserted = 0;
    let duplicates = 0;

    try {
      // Run as a single transaction: faster (one round trip instead of one
      // per row) and avoids leaving the table half-populated if a later
      // row fails.
      await database.withTransactionAsync(async () => {
        // Insert statement metadata
        if (metadata && metadata.card_last4 && metadata.bank) {
          const mCard = metadata.card_last4 || "Unknown";
          const mBank = metadata.bank || "UNKNOWN";
          const mPeriod = metadata.billing_period || "";
          const mDue = metadata.due_date || "";
          const mTotal =
            typeof metadata.total_due === "number" &&
            !Number.isNaN(metadata.total_due)
              ? metadata.total_due
              : 0;

          if (mPeriod !== "") {
            await database.runAsync(
              `DELETE FROM statements WHERE card_last4 = ? AND bank = ? AND billing_period = ?`,
              [mCard, mBank, mPeriod],
            );
          }
          await database.runAsync(
            `INSERT INTO statements (card_last4, bank, billing_period, due_date, total_due) VALUES (?, ?, ?, ?, ?)`,
            [mCard, mBank, mPeriod, mDue, mTotal],
          );
        }

        for (const tx of transactions) {
          if (!tx) continue; // skip null/undefined entries defensively

          const tAmount =
            typeof tx.amount === "number" && !Number.isNaN(tx.amount)
              ? tx.amount
              : 0;
          const tDate = tx.date || "";
          const tMerchant = tx.merchant || "";
          const tType = tx.type || "debit";
          const tCat = (tx.category || "other").trim().toLowerCase();
          const tCard = tx.cardLast4 || "";
          const tBank = tx.bank || "";
          const tDesc = tx.rawDescription || "";

          const existing = await database.getFirstAsync(
            "SELECT id FROM expenses WHERE amount = ? AND date = ? AND merchant = ? AND type = ?",
            [tAmount, tDate, tMerchant, tType],
          );
          if (existing) {
            duplicates++;
            continue;
          }

          await database.runAsync(
            `INSERT INTO expenses (amount, currency, category, merchant, note, date, type, card_last4, bank, raw_description, source)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              tAmount,
              "INR",
              tCat,
              tMerchant,
              "",
              tDate,
              tType,
              tCard,
              tBank,
              tDesc,
              "statement",
            ],
          );
          inserted++;
        }
      });
    } catch (e) {
      console.error("[financeStore] bulkInsertFromStatement failed:", e);
      throw e;
    }
    return { inserted, duplicates };
  },

  async getStatements(): Promise<StatementMetadata[]> {
    const database = await getDb();
    const rows = await database.getAllAsync<StatementMetadata>(
      "SELECT * FROM statements ORDER BY created_at DESC",
    );
    // SQLite returns integers 0/1 for booleans
    return rows.map((r) => ({
      ...r,
      is_paid: Boolean(r.is_paid),
    }));
  },

  async updateStatementPaidStatus(id: number, isPaid: boolean): Promise<boolean> {
    const database = await getDb();
    const result = await database.runAsync(
      "UPDATE statements SET is_paid = ? WHERE id = ?",
      [isPaid ? 1 : 0, id],
    );
    return result.changes > 0;
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
      let cat = filters.category.toLowerCase();
      if (cat.endsWith("ies")) cat = cat.slice(0, -3);
      else if (cat.endsWith("s")) cat = cat.slice(0, -1);

      conditions.push("category LIKE ?");
      params.push(`%${cat}%`);
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

    const where =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    return database.getAllAsync<Expense>(
      `SELECT * FROM expenses ${where} ORDER BY date DESC`,
      params,
    );
  },

  async queryByMerchant(
    merchant: string,
    dateRange?: { start: string; end: string },
  ): Promise<Expense[]> {
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

  async getSpendingSummary(dateRange?: {
    start: string;
    end: string;
  }): Promise<{ category: string; total: number; count: number }[]> {
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

    return database.getAllAsync<{
      category: string;
      total: number;
      count: number;
    }>(
      `SELECT category, SUM(amount) as total, COUNT(*) as count FROM expenses ${where} GROUP BY category ORDER BY total DESC`,
      params,
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

  async addRecurringObligation(
    ob: RecurringObligation,
  ): Promise<RecurringObligation> {
    const database = await getDb();
    const result = await database.runAsync(
      `INSERT INTO recurring_obligations 
        (type, merchant, amount, frequency, start_date, end_date, next_due_date, card_last4, status, total_installments, pending_installments, outstanding_principal)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ob.type,
        ob.merchant,
        ob.amount,
        ob.frequency,
        ob.start_date,
        ob.end_date || null,
        ob.next_due_date,
        ob.card_last4,
        ob.status,
        ob.total_installments || null,
        ob.pending_installments || null,
        ob.outstanding_principal || null,
      ],
    );
    return { ...ob, id: result.lastInsertRowId };
  },

  async getRecurringObligations(
    status?: "active" | "completed" | "cancelled",
  ): Promise<RecurringObligation[]> {
    const database = await getDb();
    if (status) {
      return database.getAllAsync<RecurringObligation>(
        `SELECT * FROM recurring_obligations WHERE status = ? ORDER BY next_due_date ASC`,
        [status],
      );
    }
    return database.getAllAsync<RecurringObligation>(
      `SELECT * FROM recurring_obligations ORDER BY next_due_date ASC`,
    );
  },

  async clearAllData(): Promise<void> {
    const database = await getDb();
    await database.execAsync("DELETE FROM expenses;");
    await database.execAsync("DELETE FROM statements;");
    await database.execAsync("DELETE FROM recurring_obligations;");
    try {
      await database.execAsync(
        "DELETE FROM sqlite_sequence WHERE name IN ('expenses', 'statements', 'recurring_obligations');",
      );
    } catch (e) {
      // Ignore if sqlite_sequence doesn't exist yet
    }
  },
};
