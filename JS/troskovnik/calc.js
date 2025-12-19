// JS/troskovnik/calc.js
import { calculateAuto } from "../calculations/autoCalc.js";

console.log("troskovnik calc.js loaded");

const MAP = {
  "pod": "pod",
  "zid": "zidovi",
  "hidro pod": "hidroPod",
  "hidro tuš": "hidroTus",
  "hidro traka": "hidroTraka",
  "silikon": "silikon",
  "sokl": "sokl",
  "lajsne": "lajsne",
  "gerung": "gerung",
  "stepenice": "stepenice"
};

export function calcFromTroskovnik() {
  const auto = calculateAuto();
  const out = document.getElementById("troskovnikOutput");
  out.innerHTML = "";

  let total = 0;

  document
    .querySelectorAll("#troskovnikItemsList input[type=checkbox]:checked")
    .forEach(cb => {
      const item = window.troskovnikItems.find(i => i.id == cb.value);
      if (!item) return;

      const key = Object.keys(MAP).find(k =>
        item.opis.toLowerCase().includes(k)
      );
      if (!key) return;

      const qty = auto[MAP[key]] || 0;
      if (qty <= 0) return;

      const sum = qty * item.cijena;
      total += sum;

      const row = document.createElement("div");
      row.textContent =
        `${item.opis} – ${qty.toFixed(2)} ${item.jm} × ` +
        `${item.cijena.toFixed(2)} € = ${sum.toFixed(2)} €`;
      out.appendChild(row);
    });

  out.innerHTML += `<hr><strong>UKUPNO: ${total.toFixed(2)} €</strong>`;
  document.getElementById("troskovnikResult").style.display = "block";

  return total;
}
