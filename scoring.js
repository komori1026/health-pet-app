export const HABIT_KEYS = ["kyukanbi", "aerobic", "tofu_first", "stretch", "posture", "omega3"];

export const STAGES = [
  { name: "たまご", min: 0 },
  { name: "幼体", min: 10 },
  { name: "少年期", min: 30 },
  { name: "成長期", min: 70 },
  { name: "成熟期", min: 150 },
  { name: "完全体", min: 300 },
];

export function calculateTotalPoints(entries) {
  let total = 0;
  for (const date in entries) {
    const day = entries[date];
    for (const key of HABIT_KEYS) {
      if (day[key] === true) total += 1;
    }
  }
  return total;
}

export function getStage(totalPoints) {
  let current = STAGES[0];
  for (const stage of STAGES) {
    if (totalPoints >= stage.min) current = stage;
  }
  return current;
}
