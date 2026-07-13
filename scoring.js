import { getWeekStart, addDays } from "./calendar.js?v=5";

export const HABITS = [
  { key: "kyukanbi", label: "休肝日", period: "weekly", target: 3, unit: "日/週" },
  { key: "aerobic", label: "有酸素運動", period: "daily", target: 20, unit: "分" },
  { key: "tofu_first", label: "食べる順番", period: "daily", target: 1, unit: "" },
  { key: "stretch", label: "ストレッチ", period: "daily", target: 5, unit: "分" },
  { key: "posture", label: "姿勢", period: "daily", target: 1, unit: "" },
  { key: "omega3", label: "オメガ3", period: "daily", target: 1, unit: "" },
];

export const HABIT_KEYS = HABITS.map((h) => h.key);

function valueOf(day, key) {
  if (!day) return 0;
  return Number(day[key]) || 0;
}

function pointThreshold(habit) {
  return habit.period === "weekly" ? 1 : habit.target;
}

export function calculateTotalPoints(entries) {
  let total = 0;
  for (const date in entries) {
    const day = entries[date];
    for (const habit of HABITS) {
      if (valueOf(day, habit.key) >= pointThreshold(habit)) total += 1;
    }
  }
  return total;
}

export function getDailyAchievement(entries, dateKey, habit) {
  const actual = valueOf(entries[dateKey], habit.key);
  return { actual, target: habit.target, achieved: actual >= habit.target };
}

export function getWeeklyAchievement(entries, dateKey, habit) {
  const weekStart = getWeekStart(dateKey);
  let actual = 0;
  for (let i = 0; i < 7; i++) {
    const d = addDays(weekStart, i);
    actual += valueOf(entries[d], habit.key);
  }
  return { actual, target: habit.target, achieved: actual >= habit.target };
}

export function getLatestComment(entries) {
  let latest = null;
  for (const dateKey in entries) {
    const comment = entries[dateKey] && entries[dateKey].ai_comment;
    if (comment && (!latest || dateKey > latest.dateKey)) {
      latest = { dateKey, comment };
    }
  }
  return latest;
}

export function findCharacterImage(entries, dateKey) {
  const keys = Object.keys(entries)
    .filter((k) => k <= dateKey && entries[k] && entries[k].character_image)
    .sort();
  if (keys.length === 0) return null;
  return entries[keys[keys.length - 1]].character_image;
}
