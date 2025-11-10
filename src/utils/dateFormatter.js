// src/utils/dateFormatter.js

/**
 * Format a date into "DD-MM-YYYY, Day" format
 * @param {string|Date} dateValue - Date string or Date object
 * @returns {string} - Formatted date like "01-01-2025, Wednesday"
 */
export function formatDateWithDay(dateValue) {
  if (!dateValue) return "-";

  const date = new Date(dateValue);
  if (isNaN(date)) return "-";

  const formattedDate = date
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .replace(/\//g, "-");

  const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

  return `${formattedDate}, ${dayName}`;
}
