// JS/core/events.js

import { calculateAuto } from "../calculations/autoCalc.js";
import { addOpening } from "../calculations/openings.js";
import { addOrUpdateCurrentRoom, clearRoomsForCurrentSite } from "../calculations/rooms.js";
import { saveToCloud } from "../cloud/cloudSave.js";
import { exportCsvFromCalc } from "../csv/csvExport.js";
import { buildPdfDocument, buildPdfDocumentForSite } from "../pdf/pdfSingle.js";
import { loadArchive } from "../cloud/cloudLoad.js";

function $(id) {
  return document.getElementById(id);
}

// ==========================
// PDF
// ==========================
$("btnExportPdfAuto")?.addEventListener("click", async () => {
  const data = calculateAuto();
  if (!data) return;

  const rooms = (window.siteRooms?.length ? window.siteRooms : [data]);

  let pdf;
  if (rooms.length === 1) pdf = await buildPdfDocument(data);
  else pdf = await buildPdfDocumentForSite(rooms);

  if (!pdf) {
    alert("Ne mogu generirati PDF.");
    return;
  }

  pdf.save("obracun.pdf");
});

// ==========================
// CSV
// ==========================
$("btnExportCsvAuto")?.addEventListener("click", () => {
  const data = calculateAuto();
  if (!data) return;

  exportCsvFromCalc(data);
});

// ==========================
// CLOUD SAVE
// ==========================
$("btnSaveCloud")?.addEventListener("click", () => {
  const data = calculateAuto();
  if (!data) return;

  saveToCloud(data);
});

// ==========================
// ARHIVA
// ==========================
$("btnOpenArchive")?.addEventListener("click", () => {
  loadArchive();
});

// ==========================
// OTVORI
// ==========================
$("btnAddDoor")?.addEventListener("click", () => addOpening("door"));
$("btnAddWindow")?.addEventListener("click", () => addOpening("window"));
$("btnAddNiche")?.addEventListener("click", () => addOpening("niche"));
$("btnAddGeberit")?.addEventListener("click", () => addOpening("geberit"));
$("btnAddVert")?.addEventListener("click", () => addOpening("vert"));
$("btnAddCustom")?.addEventListener("click", () => addOpening("custom"));

// ==========================
// VIŠE PROSTORIJA
// ==========================
$("btnAddRoomToSite")?.addEventListener("click", () => {
  addOrUpdateCurrentRoom();
});

$("btnClearRooms")?.addEventListener("click", () => {
  clearRoomsForCurrentSite();
});

// ==========================
// DODATNE MJERE
// ==========================
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
    <button class="btn-small secondary" type="button" onclick="this.parentNode.remove()">🗑</button>
  `;

  $("dmContainer")?.appendChild(box);
});

// ==========================
// RUČNI UNOS MJERA
// ==========================
$("btnAddManualMeasure")?.addEventListener("click", () => {
  const tbody = $("manualMeasuresBody");
  if (!tbody) return;

  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td><input type="text" placeholder="Naziv" style="width:100%"></td>
    <td><input type="text" placeholder="0,00" style="width:100%"></td>
    <td><input type="text" placeholder="m2" style="width:100%"></td>
  `;

  tbody.appendChild(tr);
});
