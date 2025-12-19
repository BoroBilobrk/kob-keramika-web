// ==============================
// APP INIT
// ==============================
console.log("APP.JS LOADED ✅");

// ==============================
// IMPORTI
// ==============================
import "./core/ui.js";

import { calculateAuto } from "./calculations/autoCalc.js";
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
  const fileInput = document.getElementById("troskovnikFile");
  const file = fileInput?.files?.[0];

  if (!file) {
    alert("Odaberi troškovnik (CSV / Excel / PDF)");
    return;
  }

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
  box.innerHTML = "";

  if (!window.troskovnikItems || window.troskovnikItems.length === 0) {
    box.innerHTML = "<p class='hint'>Nema učitanih stavki.</p>";
    return;
  }

  window.troskovnikItems.forEach((item, idx) => {
    const row = document.createElement("div");
    row.className = "checkbox-row";
    row.innerHTML = `
      <label>
        <input type="checkbox" data-index="${idx}" checked>
        ${item.opis} (${item.jm})
      </label>
    `;
    box.appendChild(row);
  });
}
