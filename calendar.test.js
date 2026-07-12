import { test } from "node:test";
import assert from "node:assert/strict";
import { addDays, getWeekStart, getMonthGrid } from "./calendar.js";

test("addDays は日付をn日進める", () => {
  assert.equal(addDays("2026-07-11", 1), "2026-07-12");
  assert.equal(addDays("2026-07-31", 1), "2026-08-01");
});

test("addDays は負の値で日付を戻せる", () => {
  assert.equal(addDays("2026-07-01", -1), "2026-06-30");
});

test("getWeekStart は指定日を含む週の月曜日を返す", () => {
  // 2026-07-11は土曜日
  assert.equal(getWeekStart("2026-07-11"), "2026-07-06");
  // 2026-07-06はその週の月曜日そのもの
  assert.equal(getWeekStart("2026-07-06"), "2026-07-06");
  // 2026-07-12は日曜日、2026-07-06週に含まれる
  assert.equal(getWeekStart("2026-07-12"), "2026-07-06");
});

test("getMonthGrid は月曜始まりで月全体をカバーする週単位グリッドを返す", () => {
  const grid = getMonthGrid(2026, 7); // 2026年7月1日は水曜日
  // 最初の週の月曜日は7月1日以前
  assert.ok(grid[0][0].dateKey <= "2026-07-01");
  // 各週は必ず7日
  for (const week of grid) {
    assert.equal(week.length, 7);
  }
  const flat = grid.flat();
  // 月末(7/31)はグリッドに含まれ、inMonth:trueである
  const last = flat.find((d) => d.dateKey === "2026-07-31");
  assert.ok(last);
  assert.equal(last.inMonth, true);
  // 前月のパディング日(6/30)はinMonth:falseである
  const padding = flat.find((d) => d.dateKey === "2026-06-30");
  assert.ok(padding);
  assert.equal(padding.inMonth, false);
});
