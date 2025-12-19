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
