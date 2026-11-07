/**
 * Helper utilities for Monday-Sunday Susu cycle calculations
 */

export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatDateStr(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function getNearestMonday(dateStr?: string): string {
  const d = dateStr ? parseDate(dateStr) : new Date();
  const day = d.getDay(); // 0 is Sunday, 1 is Monday, etc.
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return formatDateStr(monday);
}

export function addDays(dateStr: string, days: number): string {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatDateStr(d);
}

export function getWeekDays(mondayStr: string): string[] {
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    days.push(addDays(mondayStr, i));
  }
  return days;
}

export function formatNiceDate(dateStr: string): string {
  const d = parseDate(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatShortDate(dateStr: string): string {
  const d = parseDate(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

export function getWeekDateRangeFormatted(mondayStr: string): string {
  const sundayStr = addDays(mondayStr, 6);
  const mon = parseDate(mondayStr);
  const sun = parseDate(sundayStr);

  const monMonth = mon.toLocaleDateString('en-US', { month: 'short' });
  const sunMonth = sun.toLocaleDateString('en-US', { month: 'short' });

  if (monMonth === sunMonth) {
    return `${monMonth} ${mon.getDate()} – ${sun.getDate()}, ${sun.getFullYear()}`;
  }
  return `${monMonth} ${mon.getDate()} – ${sunMonth} ${sun.getDate()}, ${sun.getFullYear()}`;
}

export function getDayOfWeekName(dateStr: string): string {
  const d = parseDate(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'long' });
}

export function getDayOfWeekShort(dateStr: string): string {
  const d = parseDate(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

export function isToday(dateStr: string): boolean {
  const today = formatDateStr(new Date());
  return dateStr === today;
}

export function isPast(dateStr: string): boolean {
  const today = formatDateStr(new Date());
  return dateStr < today;
}

export function isFuture(dateStr: string): boolean {
  const today = formatDateStr(new Date());
  return dateStr > today;
}

export function getDaysUntil(targetDateStr: string): number {
  const today = parseDate(formatDateStr(new Date()));
  const target = parseDate(targetDateStr);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
