// JS/troskovnik/troskovnikCalc.js
// ==================================
// OBRAČUN PO TROŠKOVNIKU – PDF SITUACIJA
// ==================================

import { generateSituacijaPDF } from "../pdf/pdfSituacija.js";

console.log("troskovnikCalc.js loaded");

// ===============================
// PDF – OKONČANA / PRIVREMENA
// ===============================
document.getElementById("btnExportPdfTroskovnik")?.addEventListener("click", () => {

  // Provjera stavki
  if (!window.itemsFromTroskovnik || !Array.isArray(window.itemsFromTroskovnik)) {
    alert("Nema učitanih stavki iz troškovnika.");
    return;
  }

  if (window.itemsFromTroskovnik.length === 0) {
    alert("Lista stavki iz troškovnika je prazna.");
    return;
  }

  // Ukupno za ovu situaciju
  const totalThisSituation = window.itemsFromTroskovnik.reduce(
    (sum, item) => sum + (item.total || 0),
    0
  );

  // META PODACI
  const data = {
    meta: {
      situationNo: document.getElementById("situationNo")?.value || "",
      roomName: document.getElementById("roomName")?.value || "",
      investorName: document.getElementById("investorName")?.value || "",
      contractor: "KOB-Keramika"
    },

    // STAVKE IZ TROŠKOVNIKA
    items: window.itemsFromTroskovnik.map(i => ({
      name: i.name || i.opis || "Stavka",
      qty: Number(i.qty || i.kolicina || 0),
      unit: i.unit || i.jedinica || "",
      total: Number(i.total || 0)
    })),

    total: totalThisSituation,
    prevTotal: window.prevSituationsTotal || 0
  };

  // GENERIRAJ PDF
  const doc = generateSituacijaPDF(data, "okončana");

  const sitNo = data.meta.situationNo || "bez_broja";
  doc.save(`Situacija_${sitNo}.pdf`);
});


// ===============================
// IZRAČUN PO TROŠKOVNIKU (BASIC)
// ===============================
document.getElementById("btnCalcFromTroskovnik")?.addEventListener("click", () => {

  if (!window.itemsFromTroskovnik || window.itemsFromTroskovnik.length === 0) {
    alert("Prvo učitaj troškovnik.");
    return;
  }

  const output = document.getElementById("troskovnikOutput");
  const box = document.getElementById("troskovnikResult");

  let html = "<table class='table'>";
  html += "<tr><th>Stavka</th><th>Količina</th><th>Jed.</th><th>Iznos €</th></tr>";

  let sum = 0;

  window.itemsFromTroskovnik.forEach(item => {
    const qty = Number(item.qty || item.kolicina || 0);
    const total = Number(item.total || 0);
    sum += total;

    html += `
      <tr>
        <td>${item.name || item.opis || ""}</td>
        <td>${qty.toFixed(2)}</td>
        <td>${item.unit || item.jedinica || ""}</td>
        <td>${total.toFixed(2)}</td>
      </tr>
    `;
  });

  html += `
    <tr>
      <td colspan="3"><strong>UKUPNO</strong></td>
      <td><strong>${sum.toFixed(2)} €</strong></td>
    </tr>
  `;

  html += "</table>";

  output.innerHTML = html;
  box.style.display = "block";
});


// ===============================
// SPREMANJE U CLOUD – PLACEHOLDER
// ===============================
document.getElementById("btnSaveCloudTroskovnik")?.addEventListener("click", () => {
  alert("Spremanje u Cloud po troškovniku dolazi u sljedećem koraku.");
});
