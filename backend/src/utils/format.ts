import { DATE_LOCALE, TIME_ZONE } from "../constants";

// e.g. "05 Oct 2026, 05:28:14 pm IST"
export const formatDateTime = (date: Date): string =>
  date.toLocaleString(DATE_LOCALE, {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZoneName: "short",
  });

export const formatUptime = (totalSeconds: number): string => {
  const s = Math.floor(totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}h ${m}m ${s % 60}s`;
};
