import { HABIT_KEYS, calculateTotalPoints, getStage } from "./scoring.js";

const todayKey = new Date().toISOString().slice(0, 10);
let entries = { [todayKey]: {} };

function render() {
  document.getElementById("today-date").textContent = todayKey;
  const total = calculateTotalPoints(entries);
  const stage = getStage(total);
  document.getElementById("pet-stage-name").textContent = stage.name;
  document.getElementById("pet-points").textContent = `累計 ${total}pt`;

  document.querySelectorAll(".habit-toggle").forEach((btn) => {
    const key = btn.dataset.key;
    const checked = entries[todayKey][key] === true;
    btn.classList.toggle("active", checked);
  });
}

function setupToggles() {
  document.querySelectorAll(".habit-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.key;
      entries[todayKey][key] = !entries[todayKey][key];
      render();
    });
  });
}

setupToggles();
render();
