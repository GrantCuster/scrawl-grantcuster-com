export function dateToSlugTimestamp(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;
}

export function slugTimestampToDate(dateString: string): Date | null {
  const parts = dateString.split("-");
  if (parts.length !== 6) {
    return null;
  }
  const year = parseInt(parts[0]!, 10);
  const month = parseInt(parts[1]!, 10) - 1; // JavaScript months are zero-indexed
  const day = parseInt(parts[2]!, 10);
  const hours = parseInt(parts[3]!, 10);
  const minutes = parseInt(parts[4]!, 10);
  const seconds = parseInt(parts[5]!, 10);

  const date = new Date(year, month, day, hours, minutes, seconds);

  if (isNaN(date.getTime())) {
    return null; // Invalid date
  }

  return date;
}

export function dateToReadableString(date: Date) {
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayOfWeek = daysOfWeek[date.getDay()];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  // Determine the ordinal suffix
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
          ? "rd"
          : "th";

  let hours = date.getHours(); // Adjust for timezone offset
  const minutes = String(date.getMinutes()).padStart(2, "0");

  const amOrPm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // Convert to 12-hour format, with 12 as the starting hour

  return `${dayOfWeek}, ${month} ${day}${suffix}, ${year} at ${hours}:${minutes} ${amOrPm}`.toLowerCase();
}

export function makeDBTimestamp(date: Date): string {
  // Should not need to do this
  const timezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;
  const dbTimestamp = new Date(date.getTime() - timezoneOffset).toISOString();
  return dbTimestamp;
}
