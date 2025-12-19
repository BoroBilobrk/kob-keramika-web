// JS/app.js
console.log("APP.JS LOADED ✅");

// UI (view switching)
import "./core/ui.js";

// kalkulacije
import { calculateAuto } from "./calculations/autoCalc.js";

// troškovnik
import { loadTroskovnik } from "./troskovnik/load.js";
import { calcFromTroskovnik } from "./troskovnik/calc.js";

// ==============================
// AUTOMATSKI OBRAČUN
// ==============================
const btnCalc = document.getElementById("btnCalcNow");
const output = document.getElementById("calcOutput");
const resultBox = document.getElementById("calcResult");

btnCalc?.addEventListener("click", () => {
  const data = calculateAuto();
  resultBox.style.display = "block";
  output.textContent = JSON.stringify(data, null, 2);
});

// ==============================
// UČITAVANJE TROŠKOVNIKA
// ==============================
document.getElementById("btnLoadTroskovnik")?.addEventListener("click", () => {
  const input = document.getElementById("troskovnikFile");
  const file = input?.files[0];
  if (!file) return alert("Odaberi datoteku");
  loadTroskovnik(file);
});

// ==============================
// OBRAČUN PO TROŠKOVNIKU
// ==============================
document.getElementById("btnCalcFromTroskovnik")?.addEventListener("click", () => {
  renderTroskovnikChecklist();
  calcFromTroskovnik();
});

function renderTroskovnikChecklist() {
  const box = document.getElementById("troskovnikItemsList");
  if (!box || !window.troskovnikItems) return;

  box.innerHTML = "";
  window.troskovnikItems.forEach(i => {
    const row = document.createElement("div");
    row.innerHTML = `
      <label>
        <input type="checkbox" value="${i.id}" checked>
        ${i.opis} (${i.jm})
      </label>
    `;
    box.appendChild(row);
  });
}
