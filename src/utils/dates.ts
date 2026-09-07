// returns the Monday and Sunday of the current week as YYYY-MM-DD strings
export function getCurrentWeekRange(): { start: string; end: string } {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, ...
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return { start: toDateString(monday), end: toDateString(sunday) };
}

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}