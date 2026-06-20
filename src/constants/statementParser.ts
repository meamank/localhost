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
  unparsedLines: string[];
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
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
  ],
  education: ["udemy", "coursera", "school", "college", "tuition"],
};

function autoCategorize(description: string): string {
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => {
      // Escape special regex characters and use word boundaries
      const escapedKw = kw.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedKw}\\b`, 'i');
      return regex.test(description);
    })) {
      return category;
    }
  }
  return "other";
}

export function parseStatement(rawPdfText: string): StatementParseResult {
  // Extract Last 4 Digits of CC (Matches: XXXXXX6150)
  const ccMatch = rawPdfText.match(/XXXXXX(\d{4})/);
  const cardLast4 = ccMatch ? ccMatch[1] : "Unknown";

  // Bank detection
  let bank = "UNKNOWN";
  if (/hdfc/i.test(rawPdfText)) bank = "HDFC";
  else if (/icici/i.test(rawPdfText)) bank = "ICICI";
  else if (/sbi|state bank/i.test(rawPdfText)) bank = "SBI";

  const transactions: ParsedTransaction[] = [];

  // Catch both debits and credits from HDFC format
  const txRegex =
    /(\d{2}\/\d{2}\/\d{4})\|\s*\d{2}:\d{2}\s+(.*?)\s+(?:(?:Cr|Dr|C|D|\+|-)\s*)?([\d,]+\.\d{2})(?:\s*(Cr|Dr|C|D))?/gi;

  let match;
  while ((match = txRegex.exec(rawPdfText)) !== null) {
    const rawDate = match[1]; // "23/04/2026"
    const rawDesc = match[2].trim(); // "ZOMATO"
    const rawAmount = match[3]; // "245.00"
    const suffix = match[4]; // "Cr" etc.

    // Parse Date DD/MM/YYYY to YYYY-MM-DD
    const [dd, mm, yyyy] = rawDate.split("/");
    const date = `${yyyy}-${mm}-${dd}`;

    // Clean Amount
    const amountStr = rawAmount.replace(/,/g, "");
    const amount = parseFloat(amountStr);

    if (isNaN(amount)) continue;

    // Determine type
    const isCredit =
      (suffix && suffix.toLowerCase().startsWith("c")) ||
      /payment|reversal|refund|received/i.test(rawDesc) ||
      match[0].toLowerCase().includes("cr");

    const type = isCredit ? "credit" : "debit";

    // Clean Merchant string
    const merchant = rawDesc
      .replace(/UPI-.*?\|/g, "") // remove UPI prefixes
      .replace(/[^a-zA-Z0-9\s*]/g, "") // remove special chars
      .trim();

    transactions.push({
      date,
      merchant: rawDesc,
      amount,
      type,
      category: autoCategorize(rawDesc),
      cardLast4,
      rawDescription: rawDesc,
      bank,
    });
  }

  return {
    cardLast4,
    bank,
    transactions,
    unparsedLines: [],
  };
}
