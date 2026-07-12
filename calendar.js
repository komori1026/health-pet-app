function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDateKey(dateKey) {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(dateKey, n) {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + n);
  return formatDateKey(date);
}

export function getWeekStart(dateKey) {
  const date = parseDateKey(dateKey);
  const dow = date.getDay(); // 0=日, 1=月, ..., 6=土
  const diff = dow === 0 ? -6 : 1 - dow;
  return addDays(dateKey, diff);
}

export function getMonthGrid(year, month) {
  const monthStr = String(month).padStart(2, "0");
  const firstOfMonth = `${year}-${monthStr}-01`;
  const lastDayNum = new Date(year, month, 0).getDate();
  const lastOfMonth = `${year}-${monthStr}-${String(lastDayNum).padStart(2, "0")}`;

  const gridStart = getWeekStart(firstOfMonth);
  const gridEnd = addDays(getWeekStart(lastOfMonth), 6);

  const weeks = [];
  let cursor = gridStart;
  while (cursor <= gridEnd) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      const dateKey = addDays(cursor, i);
      week.push({ dateKey, inMonth: dateKey.slice(0, 7) === `${year}-${monthStr}` });
    }
    weeks.push(week);
    cursor = addDays(cursor, 7);
  }
  return weeks;
}
