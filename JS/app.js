// JS/app.js
console.log("APP.JS LOADED ✅");

// UI (view switching)
import "./core/ui.js";

// EVENTS (gumbi,pdf,cloud, otvori, dodatne mjere)
import "./core/events.js";

// kalkulacije
import { calculateAuto } from "./calculations/autoCalc.js";

// Excel troškovnik
import { loadTroskovnikExcel } from "./troskovnik/loadExcel.js";
import { calcFromTroskovnik } from "./troskovnik/calc.js";

// ==============================
// HELPER ZA LIJEP PRIKAZ REZULTATA
// ==============================
function renderNiceResult(data) {
  if (!data || !data.results) return "Nema podataka.";

  const r = data.results;
  const rows = [];

  const addRow = (label, value, unit) => {
    const v = Number(value || 0);
    if (!v) return; // preskoči nule
    rows.push(
      `<tr><td>${label}</td><td>${v.toFixed(2)}</td><td>${unit}</td></tr>`
    );
  };

  addRow("Pod",           r.pod,          "m²");
  addRow("Zidovi",        r.zidovi,       "m²");
  addRow("Hidro pod",     r.hidroPod,     "m²");
  addRow("Hidro tuš",     r.hidroTus,     "m²");
  addRow("Hidro ukupno",  r.hidroUkupno,  "m²");
  addRow("Hidro traka",   r.hidroTraka,   "m");
  addRow("Silikon",       r.silikon,      "m");
  addRow("Sokl",          r.sokl,         "m");
  addRow("Lajsne",        r.lajsne,       "m");
  addRow("Gerung",        r.gerung,       "m");
  addRow("Stepenice",     r.stepenice,    "m");

  if (!rows.length) return "Sve vrijednosti su 0.";

  const dims = data.dims || {};
  const dimInfo =
    dims.D || dims.S || dims.V
      ? `<p class="hint">Dimenzije: D = ${dims.D || 0} m, Š = ${dims.S || 0} m, V = ${dims.V || 0} m</p>`
      : "";

  return `
    ${dimInfo}
    <table class="table">
      <thead>
        <tr>
          <th>Stavka</th>
          <th>Količina</th>
          <th>Jedinica</th>
        </tr>
      </thead>
      <tbody>
        ${rows.join("")}
      </tbody>
    </table>
  `;
}

// ==============================
// AUTOMATSKI OBRAČUN
// ==============================
document.getElementById("btnCalcNow")?.addEventListener("click", () => {
  const data = calculateAuto();

  const resultCard = document.getElementById("calcResult");
  const resultBox = document.getElementById("calcOutput");

  if (!resultCard || !resultBox) {
    console.warn("Calc result elements not found");
    return;
  }

  resultCard.style.display = "block";
  resultBox.innerHTML = renderNiceResult(data);
});

// ==============================
// UČITAVANJE EXCEL TROŠKOVNIKA
// ==============================
document.getElementById("btnLoadTroskovnik")?.addEventListener("click", async () => {
  const fileInput = document.getElementById("troskovnikFile");
  const file = fileInput && fileInput.files && fileInput.files[0];

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
  if (!window.troskovnikItems || !window.troskovnikItems.length) {
    alert("Nema učitanih stavki");
    return;
  }
  calcFromTroskovnik();
});

// ==============================
// CHECKLIST TROŠKOVNIKA
// ==============================
function renderTroskovnikChecklist() {
  const box = document.getElementById("troskovnikItemsList");
  if (!box || !window.troskovnikItems) return;

  box.innerHTML = "";

  window.troskovnikItems.forEach(i => {
    const row = document.createElement("div");
    row.className = "troskovnik-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = String(i.id ?? "");
    checkbox.checked = true;

    const opisDiv = document.createElement("div");
    opisDiv.className = "opis";
    opisDiv.textContent = i.opis || "";

    const jmDiv = document.createElement("div");
    jmDiv.className = "jm";
    jmDiv.textContent = `(${i.jm || ""})`;

    row.appendChild(checkbox);
    row.appendChild(opisDiv);
    row.appendChild(jmDiv);

    box.appendChild(row);
  });
}
