import { StatementMetadata } from "@/src/store/financeStore";

export function getUniqueStatements(
  allStatements: StatementMetadata[],
): StatementMetadata[] {
  // Group by card and keep only the latest statement
  const latestMap = new Map<string, StatementMetadata>();
  allStatements.forEach((stmt) => {
    const key = `${stmt.bank}-${stmt.card_last4}`;
    const existing = latestMap.get(key);
    const stmtDate = stmt?.due_date ? Date.parse(stmt.due_date) : 0;
    const existingDate = existing?.due_date
      ? Date.parse(existing.due_date)
      : 0;

    if (!existing || stmtDate > existingDate) {
      latestMap.set(key, stmt);
    }
  });

  // Convert map back to array and sort chronologically (newest first)
  return Array.from(latestMap.values()).sort((a, b) => {
    const dateA = a?.due_date ? Date.parse(a.due_date) : 0;
    const dateB = b?.due_date ? Date.parse(b.due_date) : 0;
    return dateB - dateA;
  });
}
