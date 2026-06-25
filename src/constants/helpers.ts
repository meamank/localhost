/**
 * Converts a "YYYY-MM-DD" string into an object with year, month name, date, and epoch.
 * @param {string} dateString - The date string in "YYYY-MM-DD" format.
 * @returns {Object} An object containing the year, month, date, and epoch (in milliseconds).
 */
export function extractDateDetails(dateString: string) {
  // Split the string into parts
  const [yearStr, monthStr, dateStr] = dateString.split("-");

  const year = Number(yearStr);
  const monthIndex = Number(monthStr) - 1; // 0-indexed for the array and Date object
  const date = Number(dateStr);

  const monthNames = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];

  // Calculate epoch (milliseconds since Jan 1, 1970) for local midnight
  const epochTimestamp = new Date(year, monthIndex, date).getTime();

  return {
    year: year,
    month: monthNames[monthIndex],
    date: date,
    epoch: epochTimestamp,
  };
}

// Example usage:
const result = extractDateDetails("2026-05-22");
console.log(result);
