// js/calculations/rooms.js
import { state } from "../core/state.js";
import { formatHr } from "../core/helpers.js";
import { runAutoCalc } from "./autoCalc.js";
import { renderOpenings } from "./openings.js";

function cloneOpenings(src) {
  return (src || []).map(o => ({ ...o }));
}

function findRoomIndex(meta) {
  return state.siteRooms.findIndex(r =>
    (r.meta.siteName || "")    === (meta.siteName || "") &&
    (r.meta.roomName || "")    === (meta.roomName || "") &&
    (r.meta.situationNo || "") === (meta.situationNo || "")
  );
}

export function refreshRoomsList() {
  const list = document.getElementById("roomsList");
  if (!list) return;

  if (!state.siteRooms.length) {
    list.innerHTML = `<p class="hint">Još nema dodanih prostorija.</p>`;
    return;
  }

  list.innerHTML = state.siteRooms.map((r, idx) => {
    const m = r.meta || {};
    return `
      <div class="opening-card">
        <div class="opening-header">
          <div>
            <div class="opening-title">#${idx+1} ${m.roomName || "Prostorija"}</div>
            <div class="opening-meta">
              Situacija: ${m.situationNo || "-"} • Format: ${m.tileFormat ? m.tileFormat.label : "-"} •
              D×Š×V: ${formatHr(r.D)}×${formatHr(r.S)}×${formatHr(r.V)}
            </div>
          </div>
        </div>
        <div class="row-actions">
          <button class="btn-small secondary" onclick="window.loadRoomFromList(${idx})">🔁 Učitaj</button>
          <button class="btn-small secondary" onclick="window.removeRoomFromList(${idx})">🗑 Obriši</button>
        </div>
      </div>
    `;
  }).join("");
}

export function addOrUpdateCurrentRoom() {
  const data = runAutoCalc(true);
  if (!data) return;

  if (!data.meta.siteName) {
    alert("Upiši naziv gradilišta.");
    return;
  }
  if (!data.meta.roomName) {
    alert("Upiši naziv prostorije.");
    return;
  }

  const idx = findRoomIndex(data.meta);

  const roomObj = {
    D: data.D,
    S: data.S,
    V: data.V,
    meta: data.meta,
    openings: cloneOpenings(data.openings),
    results: data.results,
    prices: data.prices
  };

  if (idx === -1) {
    state.siteRooms.push(roomObj);
  } else {
    state.siteRooms[idx] = roomObj;
  }

  refreshRoomsList();
}

export function clearRoomsForCurrentSite() {
  if (!state.siteRooms.length) return;
  if (!confirm("Obrisati sve prostorije iz liste?")) return;
  state.siteRooms = [];
  refreshRoomsList();
}

export function loadRoomFromList(idx) {
  const room = state.siteRooms[idx];
  if (!room) return;

  const m = room.meta || {};
  document.getElementById("siteName").value     = m.siteName || "";
  document.getElementById("roomName").value     = m.roomName || "";
  document.getElementById("situationNo").value  = m.situationNo || "";
  document.getElementById("investorName").value = m.investorName || "";

  if (m.tileFormat && m.tileFormat.wcm && m.tileFormat.hcm) {
    const val = `${m.tileFormat.wcm}x${m.tileFormat.hcm}`;
    const select = document.getElementById("tileFormatSelect");
    const customs = document.getElementById("tileCustomFields");
    if ([...select.options].some(o => o.value === val)) {
      select.value = val;
      customs.style.display = "none";
    } else {
      select.value = "custom";
      customs.style.display = "block";
      document.getElementById("tileW").value = m.tileFormat.wcm;
      document.getElementById("tileH").value = m.tileFormat.hcm;
    }
  }

  document.getElementById("dimD").value = String(room.D).replace(".", ",");
  document.getElementById("dimS").value = String(room.S).replace(".", ",");
  document.getElementById("dimV").value = String(room.V).replace(".", ",");

  state.openings = cloneOpenings(room.openings);
  renderOpenings();
  runAutoCalc(true);
}

export function removeRoomFromList(idx) {
  if (!state.siteRooms[idx]) return;
  if (!confirm("Obrisati ovu prostoriju?")) return;
  state.siteRooms.splice(idx, 1);
  refreshRoomsList();
}
