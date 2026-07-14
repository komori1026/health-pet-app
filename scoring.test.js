import { test } from "node:test";
import assert from "node:assert/strict";
import {
  HABITS,
  HABIT_KEYS,
  calculateTotalPoints,
  getDailyAchievement,
  getWeeklyAchievement,
  getCommentForDate,
  findCharacterImage,
} from "./scoring.js";

test("HABITS は7項目を持つ", () => {
  assert.equal(HABITS.length, 7);
});

test("HABIT_KEYS はHABITSのkeyから導出される", () => {
  assert.deepEqual(HABIT_KEYS, [
    "kyukanbi",
    "aerobic",
    "tofu_first",
    "stretch",
    "posture",
    "omega3",
    "kintore",
  ]);
});

test("calculateTotalPoints は空のentriesで0を返す", () => {
  assert.equal(calculateTotalPoints({}), 0);
});

test("calculateTotalPoints は1日単位項目を目標達成した場合のみ1ptとする", () => {
  const entries = {
    "2026-07-11": {
      kyukanbi: 1, // 週単位項目なので目標(3)ではなく1以上で1pt
      aerobic: 10, // 1日単位項目、目標20に届かないので0pt
      tofu_first: 1, // 1日単位項目、目標1を達成、1pt
      stretch: 5, // 1日単位項目、目標5ちょうど達成、1pt
      posture: 0, // 1日単位項目、目標1未達、0pt
      omega3: 1, // 1日単位項目、目標1を達成、1pt
    },
  };
  // kyukanbi(1) + tofu_first(1) + stretch(1) + omega3(1) = 4pt
  assert.equal(calculateTotalPoints(entries), 4);
});

test("calculateTotalPoints は筋トレを15分以上で1ptとする", () => {
  const entries = {
    "2026-07-11": { kintore: 15 },
    "2026-07-12": { kintore: 10 },
  };
  assert.equal(calculateTotalPoints(entries), 1);
});

test("calculateTotalPoints は真偽値の既存データ(true/false)も後方互換で扱う", () => {
  const entries = {
    "2026-07-05": { tofu_first: true, posture: false },
  };
  assert.equal(calculateTotalPoints(entries), 1);
});

test("calculateTotalPoints は複数日を合算する", () => {
  const entries = {
    "2026-07-10": { tofu_first: 1, omega3: 1 },
    "2026-07-11": { tofu_first: 1 },
  };
  assert.equal(calculateTotalPoints(entries), 3);
});

test("getDailyAchievement は1日単位項目の実績と目標達成可否を返す", () => {
  const aerobic = HABITS.find((h) => h.key === "aerobic");
  const entries = { "2026-07-11": { aerobic: 15 } };
  const result = getDailyAchievement(entries, "2026-07-11", aerobic);
  assert.deepEqual(result, { actual: 15, target: 20, achieved: false });
});

test("getDailyAchievement は記録が無い日は実績0として扱う", () => {
  const aerobic = HABITS.find((h) => h.key === "aerobic");
  const result = getDailyAchievement({}, "2026-07-11", aerobic);
  assert.deepEqual(result, { actual: 0, target: 20, achieved: false });
});

test("getWeeklyAchievement は指定日を含む週(月-日)の実績を合算する", () => {
  const kyukanbi = HABITS.find((h) => h.key === "kyukanbi");
  const entries = {
    "2026-07-06": { kyukanbi: 1 }, // 月
    "2026-07-08": { kyukanbi: 1 }, // 水
    "2026-07-11": { kyukanbi: 0 }, // 土
  };
  const result = getWeeklyAchievement(entries, "2026-07-09", kyukanbi);
  assert.deepEqual(result, { actual: 2, target: 3, achieved: false });
});

test("getWeeklyAchievement は週の実績が目標に達すればachieved:trueになる", () => {
  const kyukanbi = HABITS.find((h) => h.key === "kyukanbi");
  const entries = {
    "2026-07-06": { kyukanbi: 1 },
    "2026-07-07": { kyukanbi: 1 },
    "2026-07-08": { kyukanbi: 1 },
  };
  const result = getWeeklyAchievement(entries, "2026-07-12", kyukanbi);
  assert.deepEqual(result, { actual: 3, target: 3, achieved: true });
});

test("getCommentForDate は指定日にai_commentが無ければnullを返す", () => {
  const entries = { "2026-07-11": { aerobic: 10 } };
  assert.equal(getCommentForDate(entries, "2026-07-11"), null);
});

test("getCommentForDate はエントリ自体が無くてもnullを返す", () => {
  assert.equal(getCommentForDate({}, "2026-07-11"), null);
});

test("getCommentForDate は指定日のai_commentを返す", () => {
  const entries = {
    "2026-07-11": { aerobic: 10, ai_comment: "今日も一緒にがんばろう" },
  };
  assert.equal(getCommentForDate(entries, "2026-07-11"), "今日も一緒にがんばろう");
});

test("getCommentForDate は他の日付のai_commentを返さない", () => {
  const entries = {
    "2026-07-10": { ai_comment: "昨日のコメント" },
    "2026-07-11": { ai_comment: "今日のコメント" },
  };
  assert.equal(getCommentForDate(entries, "2026-07-11"), "今日のコメント");
});

test("findCharacterImage はentriesが空ならnullを返す", () => {
  assert.equal(findCharacterImage({}, "2026-07-13"), null);
});

test("findCharacterImage は指定日にcharacter_imageがあればそれを返す", () => {
  const entries = {
    "2026-07-13": { character_image: "history/2026-07-13.png" },
  };
  assert.equal(findCharacterImage(entries, "2026-07-13"), "history/2026-07-13.png");
});

test("findCharacterImage は指定日に無ければ直近の過去日にフォールバックする", () => {
  const entries = {
    "2026-07-10": { character_image: "history/2026-07-10.png" },
    "2026-07-12": { character_image: "history/2026-07-12.png" },
  };
  assert.equal(findCharacterImage(entries, "2026-07-13"), "history/2026-07-12.png");
});

test("findCharacterImage は指定日より後の日付は無視する", () => {
  const entries = {
    "2026-07-14": { character_image: "history/2026-07-14.png" },
  };
  assert.equal(findCharacterImage(entries, "2026-07-13"), null);
});

test("findCharacterImage はcharacter_imageを持たない日をスキップする", () => {
  const entries = {
    "2026-07-11": { aerobic: 10 },
    "2026-07-09": { character_image: "history/2026-07-09.png" },
  };
  assert.equal(findCharacterImage(entries, "2026-07-11"), "history/2026-07-09.png");
});
