export function formatDateWithDay(dateValue) {
  if (!dateValue) return "-";

  const date = new Date(dateValue);
  if (isNaN(date)) return "-";

  const formattedDate = date
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(/\//g, "-");

  const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

  return `${formattedDate.replaceAll(' ', '-')}, ${dayName}`;
}

export const extractMongooseMessage = (msg) => {
  if (!msg) return null;

  // Match last part after colon
  const parts = msg.split(":");
  return parts[parts.length - 1].trim();
};

export const getDateNDaysAgo = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

export const generateMockData = (days = 30) => {
  const data = [];
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < days; i++) {
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() - i);
    // Generate random sales amount (more fluctuation for a better line graph)
    const amount = 5000 + Math.floor(Math.random() * 25000);
    data.unshift({
      date: date.toISOString().split('T')[0], // YYYY-MM-DD format
      amount: amount,
      day: date.toLocaleDateString('en-US', { weekday: 'short' }), // e.g., 'Mon'
    });
  }
  return data;
};

export const formatAmount = (num) => {
  // Only show K for values >= 10,000 to keep low values readable
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return `${Math.round(num).toLocaleString()}`;
};