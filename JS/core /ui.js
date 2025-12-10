// js/core/ui.js
import { addOpening, removeOpening, renderOpenings } from "../calculations/openings.js";
import { runAutoCalc } from "../calculations/autoCalc.js";
import {
  addOrUpdateCurrentRoom,
  clearRoomsForCurrentSite,
  loadRoomFromList,
  removeRoomFromList,
  refreshRoomsList
} from "../calculations/rooms.js";
import { exportCsv } from "../csv/csvExport.js";
import { saveToCloud } from "../cloud/cloudSave.js";
import { loadArchive, reloadFromCloud } from "../cloud/cloudLoad.js";
import { deleteCloudRecord } from "../cloud/cloudDelete.js";
import { UNIT_PRICES } from "../calculations/cjenik.js";
import { parseNum, formatHr } from "./helpers.js";

function showView(id) {
  document.querySelectorAll(".view").forEach(v => v.style.display = "none");
  const el = document.getElementById(id);
  if (el) el.style.display = "block";
}

window.removeOpening      = removeOpening;
window.loadRoomFromList   = loadRoomFromList;
window.removeRoomFromList = removeRoomFromList;
window.reloadFromCloud    = reloadFromCloud;
window.deleteCloudRecord  = deleteCloudRecord;

document.addEventListener("DOMContentLoaded", () => {

  // Back gumbi
  document.querySelectorAll(".btn-back").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.target || "homeView";
      showView(target);
    });
  });

  // Meni
  document.getElementById("btnOpenAutoCalc")?.addEventListener("click", () => showView("autoCalcView"));
  document.getElementById("btnOpenMeasures")?.addEventListener("click", () => showView("measuresView"));
  document.getElementById("btnOpenCosts")?.addEventListener("click", () => showView("costsView"));
  document.getElementById("btnOpenPrices")?.addEventListener("click", () => showView("pricesView"));
  document.getElementById("btnOpenArchive")?.addEventListener("click", () => {
    showView("archiveView");
    loadArchive();
  });

  // Tile format
  const tileSelect = document.getElementById("tileFormatSelect");
  const tileCustomFields = document.getElementById("tileCustomFields");
  tileSelect?.addEventListener("change", () => {
    if (tileSelect.value === "custom") tileCustomFields.style.display = "block";
    else tileCustomFields.style.display = "none";
  });

  // Otvori
  document.getElementById("btnAddDoor")?.addEventListener("click", () => addOpening("vrata","Vrata"));
  document.getElementById("btnAddWindow")?.addEventListener("click", () => addOpening("prozor","Prozor"));
  document.getElementById("btnAddNiche")?.addEventListener("click", () => addOpening("nisa","Niša"));
  document.getElementById("btnAddGeberit")?.addEventListener("click", () => addOpening("geberit","Geberit"));
  document.getElementById("btnAddVert")?.addEventListener("click", () => addOpening("vert","Vertikala"));
  document.getElementById("btnAddCustom")?.addEventListener("click", () => addOpening("custom","Custom otvor"));

  // Izračun
  document.getElementById("btnCalcNow")?.addEventListener("click", () => {
    runAutoCalc(true);
  });

  // Prostorije
  document.getElementById("btnAddRoomToSite")?.addEventListener("click", addOrUpdateCurrentRoom);
  document.getElementById("btnClearRooms")?.addEventListener("click", clearRoomsForCurrentSite);
  refreshRoomsList();

  // Dodatne mjere
  document.getElementById("btnAddDm")?.addEventListener("click", () => {
    const box = document.createElement("div");
    box.className = "dm-row";
    box.innerHTML = `
      <input class="dmName" placeholder="Naziv mjere">
      <input class="dmVal" placeholder="0,00">
      <select class="dmSign">
        <option value="+">+</option>
        <option value="-">-</option>
      </select>
      <button class="btn-small secondary" type="button">🗑</button>
    `;
    box.querySelector("button").addEventListener("click", () => box.remove());
    document.getElementById("dmContainer").appendChild(box);
  });

  // Ručni unos mjera
  document.getElementById("btnAddManualMeasure")?.addEventListener("click", () => {
    const tbody = document.getElementById("manualMeasuresBody");
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="text" placeholder="Naziv"></td>
      <td><input type="text" placeholder="0,00"></td>
      <td><input type="text" placeholder="m2"></td>
    `;
    tbody.appendChild(tr);
  });

  // Troškovi
  document.getElementById("btnCalcCosts")?.addEventListener("click", () => {
    const hourly = parseNum(document.getElementById("costHourly").value);
    const hours  = parseNum(document.getElementById("costHours").value);
    const other  = parseNum(document.getElementById("costOther").value);
    const total = hourly * hours + other;
    document.getElementById("costsOutput").innerHTML =
      `<b>Ukupni troškovi:</b> ${formatHr(total,2)} EUR`;
  });

  // Cjenik
  const pricesList = document.getElementById("pricesList");
  if (pricesList) {
    pricesList.innerHTML = Object.keys(UNIT_PRICES).map(k => `
      <div class="opening-card">
        <div class="opening-title">${k}</div>
        <div class="opening-meta">${formatHr(UNIT_PRICES[k],2)} EUR</div>
      </div>
    `).join("");
  }

  // PDF / CSV / Cloud
  document.getElementById("btnExportPdfAuto")?.addEventListener("click", () => {
    const data = runAutoCalc(true);
    if (!data) return;

    // Multi-room PDF se radi u cloudSave i pdfSite, ali ovdje radimo jednostavniji: ako ima više soba koristi pdfSite
    import("../pdf/pdfSingle.js").then(({ buildPdfDocument }) => {
      import("../pdf/pdfSite.js").then(({ buildPdfDocumentForSite }) => {
        const { state } = requireState(); // hack is messy; umjesto toga znamo da multi ide preko Cloud – možeš kasnije doraditi
      });
    });
    // Za sad – jednostavno: uvijek jedna prostorija
    import("../pdf/pdfSingle.js").then(({ buildPdfDocument }) => {
      const doc = buildPdfDocument(data);
      if (!doc) return;
      doc.save("obracun.pdf");
    });
  });

  document.getElementById("btnExportCsvAuto")?.addEventListener("click", exportCsv);

  document.getElementById("btnSaveCloud")?.addEventListener("click", () => {
    const data = runAutoCalc(true);
    if (!data) return;
    saveToCloud(data);
  });
});
