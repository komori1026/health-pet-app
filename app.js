import { calculateTotalPoints, getStage } from "./scoring.js";
import { getToken, saveToken, clearToken, fetchEntries, saveEntries } from "./github.js";

const now = new Date();
const todayKey = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  .toISOString()
  .slice(0, 10);
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
  try {
    const result = await fetchEntries();
    entries = result.entries;
    currentSha = result.sha;
    if (!entries[todayKey]) entries[todayKey] = {};
    render();
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

async function toggleHabit(key) {
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
    btn.addEventListener("click", () => toggleHabit(btn.dataset.key));
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

setupToggles();
setupTokenForm();
