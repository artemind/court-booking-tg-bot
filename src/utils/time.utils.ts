export function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `0:${mins}`;
  if (mins === 0) return `${hours}:00`;
  return `${hours}:${mins}`;

}