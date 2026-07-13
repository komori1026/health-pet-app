import {
  HABITS,
  calculateTotalPoints,
  getDailyAchievement,
  getWeeklyAchievement,
  getLatestComment,
  findCharacterImage,
} from "./scoring.js?v=5";
import { getMonthGrid } from "./calendar.js?v=5";
import { getToken, saveToken, clearToken, fetchEntries, saveEntries } from "./github.js?v=5";

const WEEKDAY_JA = ["日", "月", "火", "水", "木", "金", "土"];

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplayDate(dateKey) {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return `${m}月${d}日(${WEEKDAY_JA[date.getDay()]})`;
}

const todayKey = formatDateKey(new Date());

let entries = {};
let currentSha = null;
let selectedDate = todayKey;
let viewYear = Number(todayKey.slice(0, 4));
let viewMonth = Number(todayKey.slice(5, 7));
let dirty = false;
let sending = false;

function setStatus(text) {
  document.getElementById("save-status").textContent = text;
}

function markDirty() {
  dirty = true;
  const btn = document.getElementById("send-btn");
  btn.disabled = false;
  btn.classList.add("dirty");
  setStatus("未送信の変更があります");
}

function clearDirty() {
  dirty = false;
  const btn = document.getElementById("send-btn");
  btn.disabled = true;
  btn.classList.remove("dirty");
}

function hasEntry(dateKey) {
  const day = entries[dateKey];
  if (!day) return false;
  return HABITS.some((h) => Number(day[h.key]) > 0);
}

function renderPet() {
  const total = calculateTotalPoints(entries);
  document.getElementById("pet-points").textContent = `累計 ${total}pt`;
  renderComment();
  renderPetImage();
}

function renderPetImage() {
  const path = findCharacterImage(entries, selectedDate);
  document.getElementById("pet-image").src = path ? `characters/${path}` : "characters/current.png";
}

function renderComment() {
  const latest = getLatestComment(entries);
  const el = document.getElementById("pet-comment");
  if (latest) {
    el.textContent = latest.comment;
    el.classList.remove("hidden");
  } else {
    el.textContent = "";
    el.classList.add("hidden");
  }
}

function renderCalendar() {
  document.getElementById("calendar-month-label").textContent = `${viewYear}年${viewMonth}月`;
  const grid = document.getElementById("calendar-grid");
  grid.innerHTML = "";
  const weeks = getMonthGrid(viewYear, viewMonth);
  for (const week of weeks) {
    for (const day of week) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "calendar-day";
      if (!day.inMonth) cell.classList.add("outside");
      if (day.dateKey === todayKey) cell.classList.add("today");
      if (day.dateKey === selectedDate) cell.classList.add("selected");

      const num = document.createElement("span");
      num.className = "day-number";
      num.textContent = String(Number(day.dateKey.slice(8, 10)));
      cell.appendChild(num);

      if (hasEntry(day.dateKey)) {
        const dot = document.createElement("span");
        dot.className = "entry-dot";
        cell.appendChild(dot);
      }

      cell.addEventListener("click", () => selectDate(day.dateKey));
      grid.appendChild(cell);
    }
  }
}

function renderHabitInputs() {
  document.getElementById("selected-date").textContent = formatDisplayDate(selectedDate);
  const container = document.getElementById("habit-inputs");
  container.innerHTML = "";
  const day = entries[selectedDate] || {};

  for (const habit of HABITS) {
    const achievement =
      habit.period === "weekly"
        ? getWeeklyAchievement(entries, selectedDate, habit)
        : getDailyAchievement(entries, selectedDate, habit);

    const row = document.createElement("div");
    row.className = "habit-row";
    if (achievement.achieved) row.classList.add("achieved");

    const top = document.createElement("div");
    top.className = "habit-row-top";

    const label = document.createElement("span");
    label.className = "habit-label";
    label.textContent = habit.label;
    top.appendChild(label);

    const isToggle = habit.period === "weekly" || habit.target === 1;
    if (isToggle) {
      const value = Number(day[habit.key]) || 0;
      const check = document.createElement("button");
      check.type = "button";
      check.className = "habit-check";
      check.setAttribute("aria-label", value >= 1 ? "達成済み" : "未達成");
      check.textContent = value >= 1 ? "✓" : "";
      check.addEventListener("click", () => setValue(habit.key, value >= 1 ? 0 : 1));
      top.appendChild(check);
    } else {
      const value = Number(day[habit.key]) || 0;
      const wrap = document.createElement("span");
      wrap.className = "habit-number";

      const minus = document.createElement("button");
      minus.type = "button";
      minus.className = "stepper-btn";
      minus.textContent = "−";
      minus.addEventListener("click", () => setValue(habit.key, Math.max(0, value - 1)));

      const input = document.createElement("input");
      input.type = "number";
      input.min = "0";
      input.value = String(value);
      input.addEventListener("change", () => {
        const next = Math.max(0, Number(input.value) || 0);
        setValue(habit.key, next);
      });

      const plus = document.createElement("button");
      plus.type = "button";
      plus.className = "stepper-btn";
      plus.textContent = "+";
      plus.addEventListener("click", () => setValue(habit.key, value + 1));

      const quick5 = document.createElement("button");
      quick5.type = "button";
      quick5.className = "stepper-btn quick";
      quick5.textContent = "+5";
      quick5.addEventListener("click", () => setValue(habit.key, value + 5));

      wrap.appendChild(minus);
      wrap.appendChild(input);
      wrap.appendChild(plus);
      wrap.appendChild(quick5);
      top.appendChild(wrap);
    }

    row.appendChild(top);

    const progressText = document.createElement("span");
    progressText.className = "habit-progress-text";
    const periodLabel = habit.period === "weekly" ? "今週" : "";
    progressText.textContent = `${periodLabel}${achievement.actual}${habit.unit || ""} / 目標${habit.target}${habit.unit || ""}`;
    row.appendChild(progressText);

    const track = document.createElement("div");
    track.className = "progress-track";
    const fill = document.createElement("div");
    fill.className = "progress-fill";
    const ratio = habit.target > 0 ? Math.min(1, achievement.actual / habit.target) : 0;
    fill.style.width = `${Math.round(ratio * 100)}%`;
    track.appendChild(fill);
    row.appendChild(track);

    container.appendChild(row);
  }
}

function setValue(key, value) {
  if (!entries[selectedDate]) entries[selectedDate] = {};
  entries[selectedDate][key] = value;
  markDirty();
  renderPet();
  renderCalendar();
  renderHabitInputs();
}

function selectDate(dateKey) {
  selectedDate = dateKey;
  renderCalendar();
  renderHabitInputs();
  renderPetImage();
}

function changeMonth(delta) {
  const d = new Date(viewYear, viewMonth - 1 + delta, 1);
  viewYear = d.getFullYear();
  viewMonth = d.getMonth() + 1;
  renderCalendar();
}

async function loadEntries() {
  setStatus("読み込み中...");
  try {
    const result = await fetchEntries();
    entries = result.entries;
    currentSha = result.sha;
    renderPet();
    renderCalendar();
    renderHabitInputs();
    clearDirty();
    setStatus("");
  } catch (e) {
    clearToken();
    const section = document.getElementById("token-setup");
    const app = document.getElementById("app");
    section.classList.remove("hidden");
    app.classList.add("hidden");
    document.getElementById("token-status").textContent =
      "読み込みに失敗しました。トークンを確認してください";
  }
}

async function sendEntries() {
  if (!dirty || sending) return;
  sending = true;
  setStatus("送信中...");
  try {
    const result = await saveEntries(entries, currentSha);
    currentSha = result.content.sha;
    clearDirty();
    setStatus("送信済み");
  } catch (e) {
    setStatus("送信に失敗しました。もう一度お試しください");
  } finally {
    sending = false;
  }
}

function setupCalendarNav() {
  document.getElementById("prev-month").addEventListener("click", () => changeMonth(-1));
  document.getElementById("next-month").addEventListener("click", () => changeMonth(1));
}

function setupSendButton() {
  document.getElementById("send-btn").addEventListener("click", sendEntries);
}

function setupUnloadWarning() {
  window.addEventListener("beforeunload", (e) => {
    if (dirty) {
      e.preventDefault();
      e.returnValue = "";
    }
  });
}

function setupTokenForm() {
  const section = document.getElementById("token-setup");
  const app = document.getElementById("app");

  document.getElementById("token-save").addEventListener("click", () => {
    const value = document.getElementById("token-input").value.trim();
    if (!value) return;
    saveToken(value);
    section.classList.add("hidden");
    app.classList.remove("hidden");
    loadEntries();
  });

  if (getToken()) {
    section.classList.add("hidden");
    app.classList.remove("hidden");
    loadEntries();
    return;
  }
  section.classList.remove("hidden");
  app.classList.add("hidden");
}

setupCalendarNav();
setupSendButton();
setupUnloadWarning();
setupTokenForm();
