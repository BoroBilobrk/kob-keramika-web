// DOM shortcuts
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function initExtraDims() {
  const container = document.getElementById("extraDimsContainer");
  const btn = document.getElementById("btnAddExtraDim");
  if (!container || !btn) return;

  function addRow(dVal = "", sVal = "", vVal = "", signVal = "+") {
    const row = document.createElement("div");
    row.className = "extra-row";
    row.innerHTML = `
      <input type="text" class="exD" placeholder="d (m)" value="${dVal}">
      <input type="text" class="exS" placeholder="š (m)" value="${sVal}">
      <input type="text" class="exV" placeholder="v (m)" value="${vVal}">
      <select class="exSign">
        <option value="+" ${signVal === "+" ? "selected" : ""}>+</option>
        <option value="-" ${signVal === "-" ? "selected" : ""}>−</option>
      </select>
      <button type="button" class="btn-outline btn-small">✕</button>
    `;
    row.querySelector("button").onclick = () => row.remove();
    container.appendChild(row);
  }

  btn.addEventListener("click", () => addRow());
}

function initOpenings() {
  const list = document.getElementById("openingsList");
  if (!list) return;

  function createOpening(type) {
    const card = document.createElement("div");
    card.className = "opening-card";
    card.setAttribute("data-type", type);

    const titleMap = {
      door: "Vrata",
      window: "Prozor",
      niche: "Niša",
      geberit: "Geberit",
      vert: "Vertikala",
      custom: "Custom otvor"
    };
    const title = titleMap[type] || "Otvor";

    card.innerHTML = `
      <div class="opening-head">
        <div class="opening-title">${title}</div>
        <button type="button" class="btn-outline btn-small">Obriši</button>
      </div>
      <div class="grid-3" style="margin-top:4px;">
        <label>Širina (m)
          <input type="text" class="opW" placeholder="npr. 0,80">
        </label>
        <label>Visina (m)
          <input type="text" class="opH" placeholder="npr. 2,00">
        </label>
        <label>Količina (kom)
          <input type="text" class="opN" value="1">
        </label>
      </div>
      <div class="opening-flags">
        <span class="flag flag-on">Odbija zidove</span>
        ${type === "door" ? "" : '<span class="flag flag-on">Za silikon</span>'}
        ${type === "door" ? "" : '<span class="flag flag-on">Za hidro traku</span>'}
      </div>
    `;

    card.querySelector("button").onclick = () => card.remove();
    list.appendChild(card);
  }

  $$(".btn-chip[data-open-type]").forEach(btn => {
    btn.addEventListener("click", () => {
      const type = btn.getAttribute("data-open-type");
      createOpening(type);
    });
  });
}

function initDmRows() {
  const container = document.getElementById("dmContainer");
  const btn = document.getElementById("btnAddDmRow");
  if (!container || !btn) return;

  function addRow() {
    const row = document.createElement("div");
    row.className = "dm-row";
    row.innerHTML = `
      <input type="text" class="dmName" placeholder="npr. Balkon">
      <input type="text" class="dmVal" placeholder="npr. 3,50">
      <select class="dmSign">
        <option value="+">+</option>
        <option value="-">−</option>
      </select>
      <button type="button" class="btn-outline btn-small">✕</button>
    `;
    row.querySelector("button").onclick = () => row.remove();
    container.appendChild(row);
  }

  btn.addEventListener("click", addRow);
}

function renderRoomsTable() {
  const wrapper = document.getElementById("roomsTableWrapper");
  const totalDiv = document.getElementById("totalSummary");
  if (!wrapper || !totalDiv) return;

  if (!situationRooms.length) {
    wrapper.innerHTML = "<p style='font-size:12px;opacity:0.8;'>Još nema dodanih prostorija.</p>";
    totalDiv.innerHTML = "";
    return;
  }

  let html = '<div class="table-scroll"><table><thead><tr>';
  html += "<th>R.br</th><th>Prostorija</th><th>Pod m²</th><th>Zidovi m²</th><th>Hidro pod m²</th><th>Hidro traka m</th><th>Silikon m</th><th>Sokl m</th>";
  html += "</tr></thead><tbody>";

  situationRooms.forEach(r => {
    html += "<tr>";
    html += `<td>${r.itemNo}</td>`;
    html += `<td>${r.name}</td>`;
    html += `<td class="num">${r.pod ? formatHr(r.pod) : ""}</td>`;
    html += `<td class="num">${r.zidovi ? formatHr(r.zidovi) : ""}</td>`;
    html += `<td class="num">${r.hidroPod ? formatHr(r.hidroPod) : ""}</td>`;
    html += `<td class="num">${r.hidroTraka ? formatHr(r.hidroTraka) : ""}</td>`;
    html += `<td class="num">${r.silikon ? formatHr(r.silikon) : ""}</td>`;
    html += `<td class="num">${r.sokl ? formatHr(r.sokl) : ""}</td>`;
    html += "</tr>";
  });

  html += "</tbody></table></div>";
  wrapper.innerHTML = html;

  const totals = calcSituationTotals();
  totalDiv.innerHTML = `
    <div class="total-summary">
      Ukupno pod: <b>${formatHr(totals.pod)}</b> m² ·
      zidovi: <b>${formatHr(totals.zidovi)}</b> m² ·
      hidro pod: <b>${formatHr(totals.hidroPod)}</b> m² ·
      hidro traka: <b>${formatHr(totals.hidroTraka)}</b> m ·
      silikon: <b>${formatHr(totals.silikon)}</b> m ·
      sokl: <b>${formatHr(totals.sokl)}</b> m
    </div>
  `;
}

function clearCurrentRoom() {
  ["roomName","roomItemNo","dimD","dimS","dimV"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  ["chkPod","chkZidovi","chkHidroPod","chkHidroTraka","chkSilikon","chkSokl"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.checked = false;
  });
  $("#extraDimsContainer").innerHTML = "";
  $("#openingsList").innerHTML = "";
  $("#dmContainer").innerHTML = "";
  $("#roomCalcOutput").innerHTML = "";
}

function clearAll() {
  situationRooms.length = 0;
  renderRoomsTable();
  clearCurrentRoom();
}

document.addEventListener("DOMContentLoaded", () => {
  initExtraDims();
  initOpenings();
  initDmRows();

  const now = new Date();
  const dt = now.toLocaleDateString("hr-HR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  const tm = now.toLocaleTimeString("hr-HR", {
    hour: "2-digit",
    minute: "2-digit"
  });
  const gen = document.getElementById("generatedAt");
  if (gen) gen.textContent = dt + " " + tm;

  const btnCalcRoom = document.getElementById("btnCalcRoom");
  const btnClearRoom = document.getElementById("btnClearRoom");
  const btnExportPdf = document.getElementById("btnExportPdf");
  const btnExportCsv = document.getElementById("btnExportCsv");
  const btnClearAll = document.getElementById("btnClearAll");

  if (btnCalcRoom) {
    btnCalcRoom.addEventListener("click", () => {
      const res = calcCurrentRoom();
      const out = document.getElementById("roomCalcOutput");
      out.innerHTML = renderRoomResultText(res);

      // dodaj u situaciju
      situationRooms.push(res);
      renderRoomsTable();
    });
  }

  if (btnClearRoom) btnClearRoom.addEventListener("click", clearCurrentRoom);
  if (btnClearAll) btnClearAll.addEventListener("click", clearAll);
  if (btnExportPdf) btnExportPdf.addEventListener("click", exportPdf);
  if (btnExportCsv) btnExportCsv.addEventListener("click", exportCsv);
});
