export function formatDate(date: Date) {
  return date.toLocaleDateString(process.env.APP_LOCALE || 'en', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}