import { 
  isToday as fnsIsToday, 
  isThisWeek as fnsIsThisWeek, 
  isThisMonth as fnsIsThisMonth 
} from "date-fns";

/**
 * Safely parses a date string (either YYYY-MM-DD or YYYY-MM-DDTHH:mm) 
 * and returns a standard JS Date object in local time.
 */
export const parseLocalDate = (dateStr?: string): Date | null => {
  if (!dateStr) return null;
  try {
    let dateObj: Date;
    if (dateStr.includes("T")) {
      dateObj = new Date(dateStr);
    } else {
      // Just date part, e.g. 2026-05-28
      const parts = dateStr.split("-");
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      // Default to 08:00 if no time is specified
      dateObj = new Date(year, month, day, 8, 0);
    }

    if (isNaN(dateObj.getTime())) return null;
    return dateObj;
  } catch (e) {
    return null;
  }
};

/**
 * Formats a date string into a friendly, human-readable Indonesian date format.
 * Example: "Rabu, 28 Mei 2026, 08.00"
 */
export const formatFriendlyIndonesianDate = (dateStr?: string): string => {
  if (!dateStr) return "Belum dijadwalkan";

  const dateObj = parseLocalDate(dateStr);
  if (!dateObj) return dateStr;

  try {
    const days = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu"
    ];
    
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember"
    ];

    const dayName = days[dateObj.getDay()];
    const dateNum = dateObj.getDate();
    const monthName = months[dateObj.getMonth()];
    const yearNum = dateObj.getFullYear();
    const hoursStr = String(dateObj.getHours()).padStart(2, "0");
    const minutesStr = String(dateObj.getMinutes()).padStart(2, "0");

    return `${dayName}, ${dateNum} ${monthName} ${yearNum}, ${hoursStr}.${minutesStr}`;
  } catch (e) {
    return dateStr;
  }
};

/**
 * Checks if the parsed date string is today.
 */
export const isDateToday = (dateStr?: string): boolean => {
  if (!dateStr) return false;
  const parsed = parseLocalDate(dateStr);
  if (!parsed) return false;
  return fnsIsToday(parsed);
};

/**
 * Checks if the parsed date string falls within the current week.
 * Assumes week starts on Monday.
 */
export const isDateThisWeek = (dateStr?: string): boolean => {
  if (!dateStr) return false;
  const parsed = parseLocalDate(dateStr);
  if (!parsed) return false;
  return fnsIsThisWeek(parsed, { weekStartsOn: 1 });
};

/**
 * Checks if the parsed date string is within the current month.
 */
export const isDateThisMonth = (dateStr?: string): boolean => {
  if (!dateStr) return false;
  const parsed = parseLocalDate(dateStr);
  if (!parsed) return false;
  return fnsIsThisMonth(parsed);
};

/**
 * Converts any parsed date string to a YYYY-MM-DDTHH:mm format for datetime-local input fields.
 */
export const formatToDatetimeLocalValue = (dateStr?: string): string => {
  if (!dateStr) return "";
  const dateObj = parseLocalDate(dateStr);
  if (!dateObj) return "";
  
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
  const dd = String(dateObj.getDate()).padStart(2, "0");
  const hh = String(dateObj.getHours()).padStart(2, "0");
  const min = String(dateObj.getMinutes()).padStart(2, "0");
  
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};
