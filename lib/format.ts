/**
 * Get the start of week (Sunday) for a given date
 */
export function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();

  // Set to previous Sunday (first day of week)
  result.setDate(result.getDate() - day);

  // Reset time to 00:00:00
  result.setHours(0, 0, 0, 0);

  return result;
}

/**
 * Get the end of week (Saturday) for a given date
 */

export function endOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();

  // Set to next Saturday (last day of week)
  result.setDate(result.getDate() + (6 - day));

  // Set time to 23:59:59.999
  result.setHours(23, 59, 59, 999);

  return result;
}
/**
 * A lightweight date formatting utility
 * Supports common formatting patterns:
 * - 'MMM d, yyyy' -> 'Apr 16, 2025'
 * - 'MMM d' -> 'Apr 16'
 * - 'h:mm aa' -> '2:30 PM'
 * - 'yyyy-MM-dd' -> '2025-04-16'
 */

export function format(date: Date, pattern: string): string {
  // console.log("params", date, pattern);
  // Handle months
  if (pattern.includes("MMM")) {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    pattern = pattern.replace("MMM", monthNames[date.getMonth()]);
  } else if (pattern.includes("MM")) {
    const month = date.getMonth() + 1;
    pattern = pattern.replace("MM", month < 10 ? `0${month}` : `${month}`);

  }
  // console.log("pattern month", pattern);

  // Handle days
  if (pattern.includes("dd")) {
    const day = date.getDate();
    pattern = pattern.replace("dd", day < 10 ? `0${day}` : `${day}`);
  } else if (pattern.includes("d")) {
    pattern = pattern.replace("d", date.getDate().toString());
  }
  // console.log("pattern day", pattern);

  // Handle years
  if (pattern.includes("yyyy")) {
    pattern = pattern.replace("yyyy", date.getFullYear().toString());
  } else if (pattern.includes("yy")) {
    pattern = pattern.replace("yy", date.getFullYear().toString().slice(-2));
  }
  // console.log("pattern year", pattern);

  // Handle hours (12-hour format)
  if (pattern.includes("h:")) {
    let hours = date.getHours() % 12;
    hours = hours === 0 ? 12 : hours; // Convert 0 to 12 for 12-hour format
    pattern = pattern.replace("h", hours.toString());
  }
  // console.log("pattern hour", pattern);

  // Handle minutes
  if (pattern.includes(":mm")) {
    const minutes = date.getMinutes();
    pattern = pattern.replace(
      "mm",
      minutes < 10 ? `0${minutes}` : `${minutes}`
    );
  }
  // console.log("pattern minute", pattern);

  // Handle AM/PM
  if (pattern.includes("aa")) {
    const ampm = date.getHours() >= 12 ? "PM" : "AM";
    pattern = pattern.replace("aa", ampm);
  }
  // console.log("pattern ampm", pattern);

  return pattern;
}

/**
 * Format a date as a relative time (e.g., "2 days ago", "just now")
 */
export function formatRelative(date: Date, baseDate = new Date()): string {
  const seconds = Math.floor((baseDate.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;

  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}
