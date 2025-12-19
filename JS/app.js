// JS/app.js
console.log("APP.JS LOADED ✅");

// UI (view switching)
import "./core/ui.js";

// kalkulacije
import { calculateAuto } from "./calculations/autoCalc.js";

// troškovnik loaderi
import { loadTroskovnikCsv } from "./troskovnik/loadCsv.js";
import { loadTroskovnikExcel } from "./troskovnik/loadExcel.js";

// obračun
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
// UČITAVANJE TROŠKOVNIKA (CSV + EXCEL)
// ==============================
document.getElementById("btnLoadTroskovnik")?.addEventListener("click", async () => {
  const input = document.getElementById("troskovnikFile");
  const file = input?.files[0];

  if (!file) {
    alert("Odaberi datoteku");
    return;
  }

  const ext = file.name.split(".").pop().toLowerCase();

  try {
    if (ext === "csv") {
      await loadTroskovnikCsv(file);
    } else if (ext === "xlsx" || ext === "xls") {
      await loadTroskovnikExcel(file);
    } else {
      alert("Podržani formati su CSV i Excel (.xlsx)");
      return;
    }

    renderTroskovnikChecklist();
    alert("Troškovnik uspješno učitan ✔");

  } catch (err) {
    console.error(err);
    alert("Greška pri učitavanju troškovnika");
  }
});

// ==============================
// OBRAČUN PO TROŠKOVNIKU
// ==============================
document.getElementById("btnCalcFromTroskovnik")?.addEventListener("click", () => {
  if (!window.troskovnikItems || window.troskovnikItems.length === 0) {
    alert("Nema učitanih stavki");
    return;
  }
  calcFromTroskovnik();
});

// ==============================
// CHECKLIST RENDER
// ==============================
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
