const CONTENT_DATE_PATTERN = /^(\d{4})\.(\d{2})\.(\d{2})$/;

export function isValidContentDate(value: string): boolean {
  const match = CONTENT_DATE_PATTERN.exec(value);
  if (!match) return false;

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));

  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

export function contentDateToDate(value: string): Date {
  if (!isValidContentDate(value)) {
    throw new Error(`Invalid content date: ${value}`);
  }

  const [year, month, day] = value.split('.').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function contentDateToIso(value: string): string {
  return contentDateToDate(value).toISOString().slice(0, 10);
}
