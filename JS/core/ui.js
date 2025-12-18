// JS/core/ui.js
console.log("UI.JS LOADED");

// ==========================
// VIEW SWITCHING
// ==========================
const views = document.querySelectorAll(".view");

function showView(id) {
  views.forEach(v => v.style.display = "none");
  const el = document.getElementById(id);
  if (el) el.style.display = "block";
}

// ==========================
// HOME MENU BUTTONS
// ==========================
document.getElementById("btnOpenAutoCalc")?.addEventListener("click", () => {
  showView("autoCalcView");
});

document.getElementById("btnOpenMeasures")?.addEventListener("click", () => {
  showView("measuresView");
});

document.getElementById("btnOpenCosts")?.addEventListener("click", () => {
  showView("costsView");
});

document.getElementById("btnOpenPrices")?.addEventListener("click", () => {
  showView("pricesView");
});

document.getElementById("btnOpenArchive")?.addEventListener("click", () => {
  showView("archiveView");
});

// ==========================
// BACK BUTTONS
// ==========================
document.querySelectorAll(".btn-back").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.target;
    if (target) showView(target);
  });
});

// ==========================
// TILE FORMAT CUSTOM
// ==========================
const tileSelect = document.getElementById("tileFormatSelect");
const tileCustom = document.getElementById("tileCustomFields");

tileSelect?.addEventListener("change", () => {
  tileCustom.style.display = tileSelect.value === "custom" ? "block" : "none";
});

// ==========================
// STEPENICE TOGGLE
// ==========================
const chkStep = document.getElementById("chkStepenice");
const stepInputs = document.getElementById("stepeniceInputs");

chkStep?.addEventListener("change", () => {
  stepInputs.style.display = chkStep.checked ? "block" : "none";
});

// ==========================
// DODATNE MJERE
// ==========================
const dmContainer = document.getElementById("dmContainer");
document.getElementById("btnAddDm")?.addEventListener("click", () => {
  const row = document.createElement("div");
  row.className = "dm-row";
  row.innerHTML = `
    <input placeholder="Opis">
    <input placeholder="Vrijednost">
    <select>
      <option value="+">+</option>
      <option value="-">−</option>
    </select>
    <button class="btn-small">✖</button>
  `;
  row.querySelector("button").onclick = () => row.remove();
  dmContainer.appendChild(row);
});

// ==========================
// OTVORI – PLACEHOLDER (logika ide kasnije)
// ==========================
const openingsList = document.getElementById("openingsList");

function addOpening(type) {
  const row = document.createElement("div");
  row.className = "opening-row";
  row.innerHTML = `
    <strong>${type}</strong>
    <input placeholder="Širina (m)">
    <input placeholder="Visina (m)">
    <button class="btn-small">✖</button>
  `;
  row.querySelector("button").onclick = () => row.remove();
  openingsList.appendChild(row);
}

document.getElementById("btnAddDoor")?.onclick = () => addOpening("Vrata");
document.getElementById("btnAddWindow")?.onclick = () => addOpening("Prozor");
document.getElementById("btnAddNiche")?.onclick = () => addOpening("Niša");
document.getElementById("btnAddGeberit")?.onclick = () => addOpening("Geberit");
document.getElementById("btnAddVert")?.onclick = () => addOpening("Vertikala");
document.getElementById("btnAddCustom")?.onclick = () => addOpening("Custom");

// ==========================
// ROOMS (SITE)
// ==========================
const roomsList = document.getElementById("roomsList");

document.getElementById("btnAddRoomToSite")?.addEventListener("click", () => {
  const name = document.getElementById("roomName")?.value;
  if (!name) return alert("Upiši naziv prostorije");

  const div = document.createElement("div");
  div.textContent = `✔ ${name}`;
  roomsList.appendChild(div);

  // reset mjera NAKON spremanja prostorije
  resetRoomInputs();
});

document.getElementById("btnClearRooms")?.addEventListener("click", () => {
  roomsList.innerHTML = "";
});

// ==========================
// RESET MJERA (VAŽNO)
// ==========================
function resetRoomInputs() {
  document.getElementById("dimD").value = "";
  document.getElementById("dimS").value = "";
  document.getElementById("dimV").value = "";
  openingsList.innerHTML = "";
  dmContainer.innerHTML = "";
}

// ==========================
// PLACEHOLDERS ZA DALJNJE FAZE
// ==========================
document.getElementById("btnCalcNow")?.addEventListener("click", () => {
  console.log("CALC klik – ide autoCalc.js");
});

document.getElementById("btnExportPdfAuto")?.addEventListener("click", () => {
  console.log("PDF – ide pdf modul");
});

document.getElementById("btnSaveCloud")?.addEventListener("click", () => {
  console.log("CLOUD SAVE – ide cloud modul");
});

