// events.js
// =====================================================
// VEZANJE SVIH GUMBA NA FUNKCIJE MODULARNOG SUSTAVA
// =====================================================

import { runAutoCalc } from "../calculations/autoCalc.js";
import { addOpening, renderOpenings } from "../calculations/openings.js";
import { addOrUpdateCurrentRoom, clearRoomsForCurrentSite } from "../calculations/rooms.js";
import { saveToCloud } from "../cloud/cloudSave.js";
import { exportCsv } from "../csv/csvExport.js";
import { buildPdfDocument, buildPdfDocumentForSite } from "../pdf/pdfSingle.js";
import { loadArchive } from "../cloud/cloudLoad.js";

// ---------- HELPERS ----------
function $(id) { return document.getElementById(id); }

// =====================================================
// NAVIGACIJA — PROMJENA VIEWA
// =====================================================
export function showView(id) {
    document.querySelectorAll(".view").forEach(v => v.style.display = "none");
    $(id).style.display = "block";
}

// Gumbi za navigaciju
$("btnOpenAutoCalc")?.addEventListener("click", () => showView("autoCalcView"));
$("btnOpenMeasures")?.addEventListener("click", () => showView("measuresView"));
$("btnOpenCosts")?.addEventListener("click", () => showView("costsView"));
$("btnOpenPrices")?.addEventListener("click", () => showView("pricesView"));
$("btnOpenArchive")?.addEventListener("click", () => {
    loadArchive();
    showView("archiveView");
});

// =====================================================
// AUTOMATSKI OBRAČUN — Gumb "Izračunaj"
// =====================================================
$("btnCalcNow")?.addEventListener("click", () => {
    runAutoCalc(true);
});

// =====================================================
// PDF EXPORT — Kompletno gradilište ili jedna prostorija
// =====================================================
$("btnExportPdfAuto")?.addEventListener("click", () => {
    const data = runAutoCalc(true);
    if (!data) return;

    let rooms = window.siteRooms?.length ? window.siteRooms : [data];

    let pdf;
    if (rooms.length === 1) pdf = buildPdfDocument(data);
    else pdf = buildPdfDocumentForSite(rooms);

    pdf.save("obracun.pdf");
});

// =====================================================
// CSV EXPORT
// =====================================================
$("btnExportCsvAuto")?.addEventListener("click", () => {
    const data = runAutoCalc(true);
    if (!data) return;

    exportCsv(data);
});

// =====================================================
// SPREMANJE U CLOUD
// =====================================================
$("btnSaveCloud")?.addEventListener("click", () => {
    const data = runAutoCalc(true);
    if (!data) return;

    saveToCloud(data);
});

// =====================================================
// OTVORI (VRATA, PROZORI…)
// =====================================================
$("btnAddDoor")?.addEventListener("click", () => addOpening("vrata", "Vrata"));
$("btnAddWindow")?.addEventListener("click", () => addOpening("prozor", "Prozor"));
$("btnAddNiche")?.addEventListener("click", () => addOpening("nisa", "Niša"));
$("btnAddGeberit")?.addEventListener("click", () => addOpening("geberit", "Geberit"));
$("btnAddVert")?.addEventListener("click", () => addOpening("vert", "Vertikala"));
$("btnAddCustom")?.addEventListener("click", () => addOpening("custom", "Otvor"));

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
// DODATNE MJERE — Dodaj red
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
    $("dmContainer").appendChild(box);
});

// =====================================================
// RUČNI UNOS MJERA — Dodaj red
// =====================================================
$("btnAddManualMeasure")?.addEventListener("click", () => {
    const tbody = $("manualMeasuresBody");
    const tr = document.createElement("tr");

    tr.innerHTML = `
        <td><input type="text" placeholder="Naziv" style="width:100%"></td>
        <td><input type="text" placeholder="0,00" style="width:100%"></td>
        <td><input type="text" placeholder="m2" style="width:100%"></td>
    `;
    tbody.appendChild(tr);
});
