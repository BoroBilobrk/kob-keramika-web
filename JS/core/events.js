// JS/core/events.js
// =====================================================
// VEZANJE SVIH GUMBA NA FUNKCIJE MODULARNOG SUSTAVA
// =====================================================

import { calculateAuto } from "../calculations/autoCalc.js";
import { addOpening } from "../calculations/openings.js";
import { addOrUpdateCurrentRoom, clearRoomsForCurrentSite } from "../calculations/rooms.js";
import { saveToCloud } from "../cloud/cloudSave.js";
import { exportCsv } from "../csv/csvExport.js";
import { buildPdfDocument, buildPdfDocumentForSite } from "../pdf/pdfSingle.js";
import { loadArchive } from "../cloud/cloudLoad.js";

// ---------- HELPERS ----------
function $(id) {
  return document.getElementById(id);
}

// =====================================================
// AUTOMATSKI OBRAČUN — IZRAČUN
// =====================================================
$("btnCalcNow")?.addEventListener("click", () => {
  const data = calculateAuto();
  if (!data) return;

  $("calcResult").style.display = "block";
  $("calcOutput").textContent = JSON.stringify(data, null, 2);
});

// =====================================================
// PDF EXPORT — jedna prostorija ili cijelo gradilište
// =====================================================
$("btnExportPdfAuto")?.addEventListener("click", () => {
  const data = calculateAuto();
  if (!data) return;

  const rooms = window.siteRooms?.length ? window.siteRooms : [data];

  let pdf;
  if (rooms.length === 1) {
    pdf = buildPdfDocument(data);
  } else {
    pdf = buildPdfDocumentForSite(rooms);
  }

  pdf.save("obracun.pdf");
});

// =====================================================
// CSV EXPORT
// =====================================================
$("btnExportCsvAuto")?.addEventListener("click", () => {
  const data = calculateAuto();
  if (!data) return;

  exportCsv(data);
});

// =====================================================
// SPREMANJE U CLOUD
// =====================================================
$("btnSaveCloud")?.addEventListener("click", () => {
  const data = calculateAuto();
  if (!data) return;

  saveToCloud(data);
});

// =====================================================
// OTVORI (VRATA, PROZORI, NIŠE…)
// =====================================================
$("btnAddDoor")?.addEventListener("click", () =>
  addOpening("vrata", "Vrata")
);
$("btnAddWindow")?.addEventListener("click", () =>
  addOpening("prozor", "Prozor")
);
$("btnAddNiche")?.addEventListener("click", () =>
  addOpening("nisa", "Niša")
);
$("btnAddGeberit")?.addEventListener("click", () =>
  addOpening("geberit", "Geberit")
);
$("btnAddVert")?.addEventListener("click", () =>
  addOpening("vert", "Vertikala")
);
$("btnAddCustom")?.addEventListener("click", () =>
  addOpening("custom", "Otvor")
);

// =====================================================
// VIŠE PROSTORIJA NA GRADILIŠTU
// =====================================================
$("btnAddRoomToSite")?.addEventListener("click", () => {
  addOrUpdateCurrentRoom();
});

$("btnClearRooms")?.addEventListener("click", () => {
  clearRoomsForCurrentSite();
});

// =====================================================
// DODATNE MJERE
// =====================================================
$("btnAddDm")?.addEventListener("click", () => {
  const box = document.createElement("div");
  box.className = "dm-row";
  box.innerHTML = `
    <input class="dmName" placeholder="Naziv mjere">
    <input class="dmVal" placeholder="0,00">
    <select class="dmSign">
      <option value="+">+</option>
      <option value="-">-</option>
    </select>
    <button class="btn-small secondary" onclick="this.parentNode.remove()">🗑</button>
  `;
  $("dmContainer")?.appendChild(box);
});

// =====================================================
// RUČNI UNOS MJERA
// =====================================================
$("btnAddManualMeasure")?.addEventListener("click", () => {
  const tbody = $("manualMeasuresBody");
  if (!tbody) return;

  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input type="text" placeholder="Naziv"></td>
    <td><input type="text" placeholder="0,00"></td>
    <td><input type="text" placeholder="m2"></td>
  `;
  tbody.appendChild(tr);
});
