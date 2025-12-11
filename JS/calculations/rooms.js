// JS/calculations/rooms.js
import { AppState } from "../core/state.js";
import { $, formatHr } from "../core/helpers.js";
import { renderOpenings } from "./openings.js";

function cloneOpenings(list) {
  return (list || []).map(o => ({ ...o }));
}

export function addOrUpdateCurrentRoom(lastCalc) {
  const meta = lastCalc.meta || {};
  if (!meta.siteName || !meta.roomName) {
    alert("Upiši naziv gradilišta i prostorije prije dodavanja u listu.");
    return;
  }

  const key = meta.roomName + "||" + (meta.situationNo || "");
  const idx = AppState.siteRooms.findIndex(r => r.key === key);

  const roomObj = {
    key,
    meta,
    D: lastCalc.D,
    S: lastCalc.S,
    V: lastCalc.V,
    openings: cloneOpenings(lastCalc.openings),
    results: lastCalc.results,
    prices: lastCalc.prices
  };

  if (idx === -1) AppState.siteRooms.push(roomObj);
  else AppState.siteRooms[idx] = roomObj;

  refreshRoomsList();
}

export function clearRoomsForCurrentSite() {
  if (!AppState.siteRooms.length) return;
  if (!confirm("Obrisati sve prostorije iz liste?")) return;
  AppState.siteRooms = [];
  refreshRoomsList();
}

export function refreshRoomsList() {
  const list = $("#roomsList");
  if (!list) return;

  if (!AppState.siteRooms.length) {
    list.innerHTML = `<p class="hint">Još nema dodanih prostorija za ovo gradilište.</p>`;
    return;
  }

  list.innerHTML = "";
  AppState.siteRooms.forEach((r, idx) => {
    const div = document.createElement("div");
    div.className = "rooms-list-item";
    const m = r.meta || {};

    div.innerHTML = `
      <div><b>#${idx+1} ${m.roomName || "-"}</b> (situacija: ${m.situationNo || "-"})</div>
      <div class="hint">
        Format: ${m.tileFormat ? m.tileFormat.label : "-"} •
        D×Š×V: ${formatHr(r.D)}×${formatHr(r.S)}×${formatHr(r.V)}
      </div>
      <div class="rooms-actions" style="margin-top:6px;">
        <button class="btn-small secondary btnLoadRoom">🔁 Učitaj</button>
        <button class="btn-small secondary btnDeleteRoom">🗑 Obriši</button>
      </div>
    `;

    div.querySelector(".btnLoadRoom").addEventListener("click", () => loadRoomIntoForm(idx));
    div.querySelector(".btnDeleteRoom").addEventListener("click", () => removeRoom(idx));

    list.appendChild(div);
  });
}

function loadRoomIntoForm(idx) {
  const room = AppState.siteRooms[idx];
  if (!room) return;

  const m = room.meta || {};
  $("#siteName").value     = m.siteName || "";
  $("#roomName").value     = m.roomName || "";
  $("#situationNo").value  = m.situationNo || "";
  $("#investorName").value = m.investorName || "";

  if (m.tileFormat && m.tileFormat.wcm && m.tileFormat.hcm) {
    const val = `${m.tileFormat.wcm}x${m.tileFormat.hcm}`;
    const select = $("#tileFormatSelect");
    const custom = $("#tileCustomFields");
    if ([...select.options].some(o => o.value === val)) {
      select.value = val;
      custom.style.display = "none";
    } else {
      select.value = "custom";
      custom.style.display = "block";
      $("#tileW").value = m.tileFormat.wcm;
      $("#tileH").value = m.tileFormat.hcm;
    }
  }

  $("#dimD").value = String(room.D).replace(".", ",");
  $("#dimS").value = String(room.S).replace(".", ",");
  $("#dimV").value = String(room.V).replace(".", ",");

  AppState.openings = cloneOpenings(room.openings);
  renderOpenings();
}

function removeRoom(idx) {
  if (!AppState.siteRooms[idx]) return;
  if (!confirm("Obrisati ovu prostoriju iz liste?")) return;
  AppState.siteRooms.splice(idx, 1);
  refreshRoomsList();
}
