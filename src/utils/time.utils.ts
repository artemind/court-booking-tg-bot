export function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = String(minutes % 60).padStart(2, '0');

  if (hours === 0) return `0:${mins}`;
  return `${hours}:${mins}`;
}