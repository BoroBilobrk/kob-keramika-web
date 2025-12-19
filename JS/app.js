// JS/app.js
console.log("APP.JS LOADED ✅");

// UI (view switching)
import "./core/ui.js";

// kalkulacije
import { calculateAuto } from "./calculations/autoCalc.js";

// Excel troškovnik
import { loadTroskovnikExcel } from "./troskovnik/loadExcel.js";
import { calcFromTroskovnik } from "./troskovnik/calc.js";

// ==============================
// AUTOMATSKI OBRAČUN
// ==============================
document.getElementById("btnCalcNow")?.addEventListener("click", () => {
  const data = calculateAuto();
  document.getElementById("calcResult").style.display = "block";
  document.getElementById("calcOutput").textContent =
    JSON.stringify(data, null, 2);
});

// ==============================
// UČITAVANJE EXCEL TROŠKOVNIKA
// ==============================
document.getElementById("btnLoadTroskovnik")?.addEventListener("click", async () => {
  const file = document.getElementById("troskovnikFile")?.files[0];

  if (!file) {
    alert("Odaberi Excel (.xlsx) datoteku");
    return;
  }

  try {
    await loadTroskovnikExcel(file);
    renderTroskovnikChecklist();
    alert("Excel troškovnik učitan ✔");
  } catch (e) {
    console.error(e);
    alert("Greška pri učitavanju Excel troškovnika");
  }
});

// ==============================
// OBRAČUN PO TROŠKOVNIKU
// ==============================
document.getElementById("btnCalcFromTroskovnik")?.addEventListener("click", () => {
  if (!window.troskovnikItems?.length) {
    alert("Nema učitanih stavki");
    return;
  }
  calcFromTroskovnik();
});

// ==============================
// CHECKLIST
// ==============================
function renderTroskovnikChecklist() {
  const box = document.getElementById("troskovnikItemsList");
  if (!box) return;

  box.innerHTML = "";

  window.troskovnikItems.forEach(i => {
    const div = document.createElement("div");
    div.innerHTML = `
      <label>
        <input type="checkbox" value="${i.id}" checked>
        ${i.opis} (${i.jm})
      </label>
    `;
    box.appendChild(div);
  });
}
