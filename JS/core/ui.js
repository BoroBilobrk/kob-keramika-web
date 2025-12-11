// JS/core/ui.js
import { $, $$, parseNum, formatHr } from "./helpers.js";
import { AppState } from "./state.js";
import { addOpening, renderOpenings } from "../calculations/openings.js";
import { runAutoCalc } from "../calculations/autoCalc.js";
import { savePrices } from "../calculations/cjenik.js";
import { addOrUpdateCurrentRoom, clearRoomsForCurrentSite, refreshRoomsList } from "../calculations/rooms.js";
import { exportCsvFromCalc } from "../csv/csvExport.js";
import { buildPdfDocumentSingle } from "../pdf/pdfSingle.js";
import { buildPdfDocumentForSite } from "../pdf/pdfSite.js";
import { saveToCloud } from "../cloud/cloudSave.js";
import { loadArchive } from "../cloud/cloudLoad.js";

function showView(id) {
  $$(".view").forEach(v => v.style.display = "none");
  $("#" + id).style.display = "block";
}

document.addEventListener("DOMContentLoaded", () => {

  // Navigacija
  $("#btnOpenAutoCalc")?.addEventListener("click", () => showView("autoCalcView"));
  $("#btnOpenMeasures")?.addEventListener("click", () => showView("measuresView"));
  $("#btnOpenCosts")?.addEventListener("click", () => showView("costsView"));
  $("#btnOpenPrices")?.addEventListener("click", () => showView("pricesView"));
  $("#btnOpenArchive")?.addEventListener("click", () => {
    showView("archiveView");
    loadArchive();
  });

  $$(".btn-back").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.target || "homeView";
      showView(target);
    });
  });

  // Format pločica – custom
  const tileSelect = $("#tileFormatSelect");
  const tileCustom = $("#tileCustomFields");
  tileSelect?.addEventListener("change", () => {
    if (tileSelect.value === "custom") tileCustom.style.display = "block";
    else tileCustom.style.display = "none";
  });

  // Otvori
  $("#btnAddDoor")?.addEventListener("click", () => addOpening("door"));
  $("#btnAddWindow")?.addEventListener("click", () => addOpening("window"));
  $("#btnAddNiche")?.addEventListener("click", () => addOpening("niche"));
  $("#btnAddGeberit")?.addEventListener("click", () => addOpening("geberit"));
  $("#btnAddVert")?.addEventListener("click", () => addOpening("vert"));
  $("#btnAddCustom")?.addEventListener("click", () => addOpening("custom"));
  renderOpenings();

  // Stepenice show/hide
  $("#chkStepenice")?.addEventListener("change", () => {
    $("#stepeniceInputs").style.display = $("#chkStepenice").checked ? "block" : "none";
  });

  // Dodatne mjere
  $("#btnAddDm")?.addEventListener("click", () => {
    const row = document.createElement("div");
    row.className = "dm-row";
    row.innerHTML = `
      <input class="dmName" placeholder="Naziv mjere">
      <input class="dmVal" placeholder="0,00">
      <select class="dmSign">
        <option value="+">+</option>
        <option value="-">-</option>
      </select>
      <button class="btn-small secondary">🗑</button>
    `;
    row.querySelector("button").addEventListener("click", () => row.remove());
    $("#dmContainer").appendChild(row);
  });

  // Prostorije (lista)
  $("#btnAddRoomToSite")?.addEventListener("click", () => {
    const last = runAutoCalc(false);
    if (!last) return;
    addOrUpdateCurrentRoom(last);
  });

  $("#btnClearRooms")?.addEventListener("click", () => {
    clearRoomsForCurrentSite();
  });

  refreshRoomsList();

  // Izračun
  $("#btnCalcNow")?.addEventListener("click", () => {
    runAutoCalc(true);
  });

  // CSV export
  $("#btnExportCsvAuto")?.addEventListener("click", () => {
    const data = runAutoCalc(true);
    if (!data) return;
    exportCsvFromCalc(data);
  });

  // PDF export – ako ima više prostorija → site PDF, inače single
  $("#btnExportPdfAuto")?.addEventListener("click", () => {
    const data = runAutoCalc(true);
    if (!data) return;

    let doc;
    if (AppState.siteRooms.length > 0) {
      doc = buildPdfDocumentForSite(AppState.siteRooms);
    } else {
      doc = buildPdfDocumentSingle(data);
    }
    if (!doc) return;
    const meta = data.meta || {};
    const name = (meta.siteName || "obracun").replace(/\s+/g, "_");
    doc.save(name + ".pdf");
  });

  // Cloud save
  $("#btnSaveCloud")?.addEventListener("click", () => {
    const data = runAutoCalc(true);
    if (!data) return;
    saveToCloud(data);
  });

  // Ručni mjere – dodaj red
  $("#btnAddManualMeasure")?.addEventListener("click", () => {
    const tbody = $("#manualMeasuresBody");
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="text" placeholder="Naziv"></td>
      <td><input type="text" placeholder="0,00"></td>
      <td><input type="text" placeholder="m2"></td>
    `;
    tbody.appendChild(tr);
  });

  // Troškovi
  $("#btnCalcCosts")?.addEventListener("click", () => {
    const hourly = parseNum($("#costHourly").value);
    const hours  = parseNum($("#costHours").value);
    const other  = parseNum($("#costOther").value);
    const total  = hourly * hours + other;
    $("#costsOutput").innerHTML = `<b>Ukupni troškovi:</b> ${formatHr(total,2)} EUR`;
  });

  // Cjenik – spremi
  $("#btnSavePrices")?.addEventListener("click", () => {
    savePrices();
    alert("Cjenik spremljen (vrijednosti se koriste u obračunu i PDF-u).");
  });

  // početni view
  showView("homeView");
});
