// JS/app.js
console.log("APP.JS LOADED ✅");

// učitaj UI (view switching, gumbi)
import "./core/ui.js";

// učitaj kalkulacije
import { calculateAuto } from "./calculations/autoCalc.js";

// ==============================
// AUTO CALC BUTTON
// ==============================
const btnCalc = document.getElementById("btnCalcNow");
const output = document.getElementById("calcOutput");
const resultBox = document.getElementById("calcResult");

btnCalc?.addEventListener("click", () => {
  const data = calculateAuto();
  resultBox.style.display = "block";
  output.textContent = JSON.stringify(data, null, 2);
});
// JS/app.js
import "./core/ui.js";

import { loadTroskovnik } from "./troskovnik/load.js";
import { calcFromTroskovnik } from "./troskovnik/calc.js";

document.getElementById("btnLoadTroskovskovnik")?.addEventListener("click", () => {
  const f = document.getElementById("troskovnikFile").files[0];
  if (!f) return alert("Odaberi datoteku");
  loadTroskovnik(f);
});

document.getElementById("btnCalcFromTroskovnik")?.addEventListener("click", () => {
  renderTroskovnikChecklist();
  calcFromTroskovnik();
});

function renderTroskovnikChecklist() {
  const box = document.getElementById("troskovnikItemsList");
  box.innerHTML = "";

  window.troskovnikItems.forEach(i => {
    const row = document.createElement("div");
    row.innerHTML = `
      <label>
        <input type="checkbox" value="${i.id}">
        ${i.opis} (${i.jm})
      </label>
    `;
    box.appendChild(row);
  });
}
