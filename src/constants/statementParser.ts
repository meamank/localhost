import { RecurringObligation } from "../store/financeStore";

export interface ParsedTransaction {
  date: string; // YYYY-MM-DD (ISO)
  merchant: string; // cleaned description
  amount: number; // absolute value
  type: "debit" | "credit";
  category: string; // auto-categorized via keyword map
  cardLast4: string;
  rawDescription: string;
  bank: string;
}

export interface StatementParseResult {
  cardLast4: string;
  bank: string;
  transactions: ParsedTransaction[];
  emis: Omit<RecurringObligation, "id" | "created_at">[];
  unparsedLines: string[];
  dueDate?: string;
  billingPeriod?: string;
  totalDue?: number;
  calculatedTotal?: number;
}

export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  food: [
    "swiggy",
    "zomato",
    "dominos",
    "mcdonalds",
    "starbucks",
    "restaurant",
    "cafe",
    "food",
    "kfc",
    "pizzahut",
    "foods",
  ],
  grocery: [
    "instamart",
    "smart point",
    "blinkit",
    "zepto",
    "bigbasket",
    "jiomart",
    "now",
    "minutes",
  ],
  transport: [
    "uber",
    "ola",
    "rapido",
    "metro",
    "irctc",
    "parking",
    "makemytrip",
    "indigo",
  ],
  fuel: ["petroleum", "iocl", "indian oil", "oil"],
  shopping: ["amazon", "flipkart", "myntra", "ajio", "meesho", "nykaa"],
  bills: [
    "airtel",
    "jio",
    "vi ",
    "electricity",
    "water",
    "gas",
    "broadband",
    "dth",
    "recharge",
    "bescom",
  ],
  entertainment: [
    "netflix",
    "spotify",
    "hotstar",
    "prime",
    "bookmyshow",
    "pvr",
    "inox",
  ],
  health: [
    "pharmacy",
    "hospital",
    "clinic",
    "apollo",
    "medplus",
    "1mg",
    "pharmeasy",
    "medical",
    "drug",
    "medicine",
    "clinic",
    "diagnostic",
  ],
  education: ["udemy", "coursera", "school", "college", "tuition"],
};

function autoCategorize(description: string): string {
  const descLower = description.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (
      keywords.some((kw) => {
        const word = kw.toLowerCase().trim();
        
        // For short or common words, enforce word boundaries so "oil" doesn't match "spoil"
        if (["now", "oil", "gas", "vi"].includes(word)) {
          // Replace special characters (like underscores) with spaces so \b works correctly
          const cleanDesc = descLower.replace(/[^a-z0-9]/g, " ");
          return new RegExp(`\\b${word}\\b`, "i").test(cleanDesc);
        }
        
        // For distinct brand names (swiggy, zomato, etc), a simple substring match is safer
        // because bank statements often concatenate words (e.g., "UPIZOMATO" or "SWIGGYINSTAMART")
        return descLower.includes(word);
      })
    ) {
      return category;
    }
  }
  return "other";
}

export function parseDateStr(dateStr: string): string {
  // Matches DD/MM/YYYY or DD-MM-YYYY
  if (/^\d{2}[\/\-]\d{2}[\/\-]\d{4}$/.test(dateStr)) {
    const sep = dateStr.includes("-") ? "-" : "/";
    const [d, m, y] = dateStr.split(sep);
    return `${y}-${m}-${d}`;
  }
  const months: Record<string, string> = {
    jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
    jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
  };
  // Matches DD MMM, YYYY
  const match1 = dateStr.match(/(\d{1,2})\s+([A-Za-z]{3,9}),?\s+(\d{4})/);
  if (match1) {
    const [_, d, mStr, y] = match1;
    const m = months[mStr.substring(0, 3).toLowerCase()] || "01";
    const dPad = d.padStart(2, "0");
    return `${y}-${m}-${dPad}`;
  }
  // Matches MMM DD, YYYY
  const match2 = dateStr.match(/([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(\d{4})/);
  if (match2) {
    const [_, mStr, d, y] = match2;
    const m = months[mStr.substring(0, 3).toLowerCase()] || "01";
    const dPad = d.padStart(2, "0");
    return `${y}-${m}-${dPad}`;
  }
  return dateStr;
}

export function parseStatement(rawPdfText: string): StatementParseResult {
  // Global fallback for cardLast4
  const ccMatch = rawPdfText.match(/X{4,}(\d{4})/i);
  const globalCardLast4 = ccMatch ? ccMatch[1] : "Unknown";

  // Bank detection
  let bank = "UNKNOWN";
  if (/hdfc/i.test(rawPdfText)) bank = "HDFC";
  else if (/icici/i.test(rawPdfText)) bank = "ICICI";
  else if (/sbi|state bank/i.test(rawPdfText)) bank = "SBI";
  else if (/yes\s*bank/i.test(rawPdfText)) bank = "YES BANK";

  const transactions: ParsedTransaction[] = [];
  const emis: Omit<RecurringObligation, "id" | "created_at">[] = [];
  const lines = rawPdfText.split('\n');
  let currentCardLast4 = globalCardLast4;

  const txRegex =
    /^\s*(\d{2}[\/\-]\d{2}[\/\-]\d{4})[|\s]+(?:\d{2}:\d{2}\s+)?(.*?)\s+(?:(?:Cr|Dr|C|D|\+|-)\s*)?([\d,]+\.\d{2})(?:\s*(Cr|Dr|C|D))?/i;

  for (const line of lines) {
    // EMI Detection (ICICI format)
    const emiMatch = line.match(
      /^\s*(.*?)\s+(\d{2}[\/\-]\d{2}[\/\-]\d{4})\s+(\d{2}[\/\-]\d{2}[\/\-]\d{4})\s+(\d+)\s+([\d,]+\.\d{2})\s+(\d+)\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})/i,
    );
    if (emiMatch) {
      emis.push({
        type: "emi",
        merchant: emiMatch[1].trim(),
        start_date: parseDateStr(emiMatch[2]),
        end_date: parseDateStr(emiMatch[3]),
        total_installments: parseInt(emiMatch[4], 10),
        amount: parseFloat(emiMatch[8].replace(/,/g, "")), // Monthly Installment Amount
        pending_installments: parseInt(emiMatch[6], 10),
        outstanding_principal: parseFloat(emiMatch[7].replace(/,/g, "")),
        frequency: "monthly",
        next_due_date: "", // Set after we find dueDate
        card_last4: currentCardLast4,
        status: "active",
      });
      continue;
    }

    const match = txRegex.exec(line);
    if (match) {
      const rawDate = match[1]; // "28/06/2026"
      const rawDesc = match[2].trim(); // "13684547118 Interest ... PVT 0"
      const rawAmount = match[3]; // "466.36"
      const suffix = match[4]; // "CR" etc.

      // Parse Date DD/MM/YYYY or DD-MM-YYYY to YYYY-MM-DD
      const separator = rawDate.includes("-") ? "-" : "/";
      const [dd, mm, yyyy] = rawDate.split(separator);
      const date = `${yyyy}-${mm}-${dd}`;

      // Clean Amount
      const amountStr = rawAmount.replace(/,/g, "");
      const amount = parseFloat(amountStr);

      if (isNaN(amount)) continue;

      const descLower = rawDesc.toLowerCase();
      if (
        descLower.includes("credit limit") ||
        descLower.includes("available credit") ||
        descLower.includes("opening balance") ||
        descLower.includes("closing balance") ||
        descLower.includes("total amount due") ||
        descLower.includes("total due") ||
        descLower.includes("statement balance") ||
        descLower.includes("previous balance") ||
        descLower.includes("cash limit") ||
        descLower.includes("available cash") ||
        descLower.includes("emi conversions") ||
        /^to\s*\d{2}[\/\-]\d{2}[\/\-]\d{4}/.test(descLower) ||
        /^from\s*\d{2}[\/\-]\d{2}[\/\-]\d{4}/.test(descLower) ||
        /^\d{2}[\/\-]\d{2}[\/\-]\d{4}$/.test(descLower)
      ) {
        continue;
      }

      const isCredit =
        (suffix && suffix.toLowerCase().startsWith("c")) ||
        /payment|reversal|refund|received/i.test(rawDesc) ||
        match[0].toLowerCase().includes("cr");

      const type = isCredit ? "credit" : "debit";

      // Clean Merchant string
      const merchant = rawDesc
        .replace(/UPI-.*?\|/g, "") // remove UPI prefixes
        .replace(/^[0-9]{9,}\s*/, "") // remove ICICI 11-digit SerNo prefix
        .replace(/\s+[0-9]+$/, "") // remove ICICI trailing Reward Points
        .replace(/[^a-zA-Z0-9\s*]/g, "") // remove special chars
        .trim();

      transactions.push({
        date,
        merchant: merchant,
        amount,
        type,
        category: autoCategorize(merchant),
        cardLast4: currentCardLast4,
        rawDescription: rawDesc,
        bank,
      });
    }
  }

  const dateRegex =
    /(\d{2}[\/\-]\d{2}[\/\-]\d{4}|\d{1,2}\s+[A-Za-z]{3,9},?\s+\d{4}|[A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})/;

  const dueDateMatch = rawPdfText.match(
    new RegExp(
      `(?:Payment\\s*)?Due\\s*Date[\\s\\S]{0,150}?${dateRegex.source}`,
      "i",
    ),
  );
  const dueDateRaw = dueDateMatch ? dueDateMatch[1] : undefined;
  let dueDate = undefined;
  if (dueDateRaw) {
    dueDate = parseDateStr(dueDateRaw);
  }

  const equationMatch = rawPdfText.match(
    /=\s*(?:[A-Za-z\u20B9]?\s*)?([\d,]+\.\d{2})/,
  );
  let totalDue = undefined;
  if (equationMatch) {
    totalDue = parseFloat(equationMatch[1].replace(/,/g, ""));
  } else {
    const totalDueMatch = rawPdfText.match(
      /Total\s*(?:Amount\s*)?Due[s]?[\s\S]{0,150}?[^0-9]?([\d,]+\.\d{2})/i,
    );
    if (totalDueMatch) {
      totalDue = parseFloat(totalDueMatch[1].replace(/,/g, ""));
    }
  }

  const periodMatch = rawPdfText.match(
    new RegExp(
      `(?:Statement|Billing)\\s*(?:Period|Date)[\\s\\S]{0,150}?${dateRegex.source}[\\s\\S]{1,30}?${dateRegex.source}`,
      "i",
    ),
  );
  let billingPeriod = undefined;
  if (periodMatch) {
    billingPeriod = `${parseDateStr(periodMatch[1])} to ${parseDateStr(periodMatch[2])}`;
  }

  const calculatedTotal = transactions.reduce((sum, t) => {
    // Skip payments towards the credit card bill itself
    if (
      t.type === "credit" &&
      /payment/i.test(t.rawDescription || t.merchant || "")
    ) {
      return sum;
    }
    return sum + (t.type === "debit" ? t.amount : -t.amount);
  }, 0);

  // Set the next_due_date for EMIs now that we know the statement's dueDate
  emis.forEach((emi) => {
    emi.next_due_date = dueDate || emi.start_date;
  });

  return {
    cardLast4: globalCardLast4,
    bank,
    transactions,
    emis,
    unparsedLines: [],
    dueDate,
    billingPeriod,
    totalDue,
    calculatedTotal: parseFloat(calculatedTotal.toFixed(2)),
  };
}
