import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateTotalPoints, getStage, STAGES, HABIT_KEYS } from "./scoring.js";

test("HABIT_KEYS は6項目を持つ", () => {
  assert.equal(HABIT_KEYS.length, 6);
});

test("calculateTotalPoints は空のentriesで0を返す", () => {
  assert.equal(calculateTotalPoints({}), 0);
});

test("calculateTotalPoints は複数日のtrue値を合算する", () => {
  const entries = {
    "2026-07-10": { kyukanbi: true, aerobic: true, tofu_first: false, stretch: true, posture: false, omega3: true },
    "2026-07-11": { kyukanbi: false, aerobic: true, tofu_first: true, stretch: false, posture: false, omega3: true },
  };
  assert.equal(calculateTotalPoints(entries), 7);
});

test("calculateTotalPoints は未知のキーを無視する", () => {
  const entries = { "2026-07-10": { kyukanbi: true, unknown_key: true } };
  assert.equal(calculateTotalPoints(entries), 1);
});

test("getStage は0ptで最初のステージを返す", () => {
  assert.equal(getStage(0).name, STAGES[0].name);
});

test("getStage は境界値で正しいステージを返す", () => {
  assert.equal(getStage(9).name, "たまご");
  assert.equal(getStage(10).name, "幼体");
  assert.equal(getStage(299).name, "成熟期");
  assert.equal(getStage(300).name, "完全体");
});
