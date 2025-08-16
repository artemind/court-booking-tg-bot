export function formatDate(date: Date, locale?: string) {
  return date.toLocaleDateString(locale || process.env.APP_LOCALE || 'en', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}