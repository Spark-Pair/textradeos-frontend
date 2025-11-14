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

export const extractMongooseMessage = (msg) => {
  if (!msg) return null;

  // Match last part after colon
  const parts = msg.split(":");
  return parts[parts.length - 1].trim();
};

