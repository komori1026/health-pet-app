export const HABITS = [
  { key: "kyukanbi", label: "休肝日", period: "daily", target: 1, unit: "" },
  { key: "aerobic", label: "有酸素運動", period: "daily", target: 20, unit: "分" },
  { key: "tofu_first", label: "食べる順番", period: "daily", target: 1, unit: "" },
  { key: "stretch", label: "ストレッチ", period: "daily", target: 5, unit: "分" },
  { key: "posture", label: "姿勢", period: "daily", target: 1, unit: "" },
  { key: "omega3", label: "オメガ3", period: "daily", target: 6, unit: "錠", step: 1, max: 6 },
  { key: "kintore", label: "筋トレ", period: "daily", target: 15, unit: "分" },
];

export const HABIT_KEYS = HABITS.map((h) => h.key);

function valueOf(day, key) {
  if (!day) return 0;
  return Number(day[key]) || 0;
}

export function calculateTotalPoints(entries) {
  return calculateTotalPointsUpTo(entries, null);
}

export function calculateTotalPointsUpTo(entries, dateKey) {
  let total = 0;
  for (const date in entries) {
    if (dateKey && date > dateKey) continue;
    const day = entries[date];
    for (const habit of HABITS) {
      if (valueOf(day, habit.key) >= habit.target) total += 1;
    }
  }
  return total;
}

export function getDailyAchievement(entries, dateKey, habit) {
  const actual = valueOf(entries[dateKey], habit.key);
  return { actual, target: habit.target, achieved: actual >= habit.target };
}

export function getCommentForDate(entries, dateKey) {
  const comment = entries[dateKey] && entries[dateKey].ai_comment;
  return comment || null;
}

export function findCharacterImage(entries, dateKey) {
  const keys = Object.keys(entries)
    .filter((k) => k <= dateKey && entries[k] && entries[k].character_image)
    .sort();
  if (keys.length === 0) return null;
  return entries[keys[keys.length - 1]].character_image;
}
