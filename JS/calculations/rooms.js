// JS/calculations/rooms.js
import { AppState } from "../core/state.js";
import { formatHr } from "../core/helpers.js";

// =====================================================
// DODAJ ILI AŽURIRAJ TRENUTNU PROSTORIJU
// =====================================================
export function addOrUpdateCurrentRoom() {
  const data = window.lastCalcResult;

  if (!data || !data.meta) {
    alert("Prvo izračunaj prostoriju.");
    return;
  }

  if (!Array.isArray(AppState.siteRooms)) {
    AppState.siteRooms = [];
  }

  const meta = data.meta;
  const roomKey = `${meta.siteName || ""}__${meta.roomName || ""}`;

  const index = AppState.siteRooms.findIndex(r =>
    r?.meta &&
    `${r.meta.siteName || ""}__${r.meta.roomName || ""}` === roomKey
  );

  if (index >= 0) {
    AppState.siteRooms[index] = structuredClone(data);
  } else {
    AppState.siteRooms.push(structuredClone(data));
  }

  refreshRoomsList();
}

// =====================================================
// OČISTI SVE PROSTORIJE
// =====================================================
export function clearRoomsForCurrentSite() {
  if (!confirm("Sigurno želiš obrisati sve prostorije?")) return;
  AppState.siteRooms = [];
  refreshRoomsList();
}

// =====================================================
// PRIKAZ LISTE PROSTORIJA
// =====================================================
export function refreshRoomsList() {
  const box = document.getElementById("roomsList");
  if (!box) return;

  if (!AppState.siteRooms?.length) {
    box.innerHTML = "<div class='hint'>Nema dodanih prostorija.</div>";
    return;
  }

  box.innerHTML = "";

  AppState.siteRooms.forEach((room, i) => {
    const m = room.meta || {};
    const r = room.results || {};

    const div = document.createElement("div");
    div.className = "rooms-list-item";

    div.innerHTML = `
      <b>${m.roomName || "Prostorija"}</b><br>
      <span class="hint">
        Pod: ${formatHr(r.pod)} m² • 
        Zidovi: ${formatHr(r.zidoviNeto)} m² • 
        Hidro: ${formatHr(r.hidroUkupno)} m²
      </span>
      <div class="rooms-actions" style="margin-top:6px;">
        <button class="btn-small secondary" data-i="${i}" data-act="load">📄 Učitaj</button>
        <button class="btn-small secondary" data-i="${i}" data-act="delete">🗑 Obriši</button>
      </div>
    `;

    box.appendChild(div);
  });

  box.querySelectorAll("button").forEach(btn => {
    const i = Number(btn.dataset.i);
    const act = btn.dataset.act;

    if (act === "load") {
      btn.addEventListener("click", () => loadRoomToForm(i));
    }

    if (act === "delete") {
      btn.addEventListener("click", () => {
        if (!confirm("Obrisati ovu prostoriju?")) return;
        AppState.siteRooms.splice(i, 1);
        refreshRoomsList();
      });
    }
  });
}

// =====================================================
// UČITAJ PROSTORIJU NATRAG U FORMU
// =====================================================
function loadRoomToForm(index) {
  const room = AppState.siteRooms[index];
  if (!room) return;

  window.lastCalcResult = structuredClone(room);

  const m = room.meta || {};

  // META
  document.getElementById("siteName").value = m.siteName || "";
  document.getElementById("roomName").value = m.roomName || "";
  document.getElementById("situationNo").value = m.situationNo || "";
  document.getElementById("investorName").value = m.investorName || "";

  // DIMENZIJE
  document.getElementById("dimD").value = formatHr(room.D);
  document.getElementById("dimS").value = formatHr(room.S);
  document.getElementById("dimV").value = formatHr(room.V);

  // 🔁 AUTOMATSKI NOVI IZRAČUN (KLJUČNO)
  if (typeof window.calculateAuto === "function") {
    window.calculateAuto();
  }

  alert("Prostorija učitana i ponovno izračunata.");
}
