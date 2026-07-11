import { HABIT_KEYS, calculateTotalPoints, getStage } from "./scoring.js";
import { getToken, saveToken, fetchEntries, saveEntries } from "./github.js";

const todayKey = new Date().toISOString().slice(0, 10);
let entries = {};
let currentSha = null;
let saving = false;

function render() {
  document.getElementById("today-date").textContent = todayKey;
  const total = calculateTotalPoints(entries);
  const stage = getStage(total);
  document.getElementById("pet-stage-name").textContent = stage.name;
  document.getElementById("pet-points").textContent = `累計 ${total}pt`;

  const todayEntry = entries[todayKey] || {};
  document.querySelectorAll(".habit-toggle").forEach((btn) => {
    const key = btn.dataset.key;
    btn.classList.toggle("active", todayEntry[key] === true);
  });
}

function setStatus(text) {
  document.getElementById("save-status").textContent = text;
}

async function loadEntries() {
  setStatus("読み込み中...");
  const result = await fetchEntries();
  entries = result.entries;
  currentSha = result.sha;
  if (!entries[todayKey]) entries[todayKey] = {};
  render();
  setStatus("");
}

async function toggleHabit(key, btn) {
  if (saving) return;
  const previous = entries[todayKey][key] === true;
  entries[todayKey][key] = !previous;
  render();
  saving = true;
  setStatus("保存中...");
  try {
    const result = await saveEntries(entries, currentSha);
    currentSha = result.content.sha;
    setStatus("保存済み");
  } catch (e) {
    entries[todayKey][key] = previous;
    render();
    setStatus("保存に失敗しました。もう一度タップしてください");
  } finally {
    saving = false;
  }
}

function setupToggles() {
  document.querySelectorAll(".habit-toggle").forEach((btn) => {
    btn.addEventListener("click", () => toggleHabit(btn.dataset.key, btn));
  });
}

function setupTokenForm() {
  const section = document.getElementById("token-setup");
  const app = document.getElementById("app");
  if (getToken()) {
    section.classList.add("hidden");
    app.classList.remove("hidden");
    loadEntries();
    return;
  }
  section.classList.remove("hidden");
  app.classList.add("hidden");
  document.getElementById("token-save").addEventListener("click", () => {
    const value = document.getElementById("token-input").value.trim();
    if (!value) return;
    saveToken(value);
    section.classList.add("hidden");
    app.classList.remove("hidden");
    loadEntries();
  });
}

setupToggles();
setupTokenForm();
