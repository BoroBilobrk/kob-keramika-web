// JS/cloud/cloudLoad.js
import { db } from "./firebase-init.js";
import { AppState } from "../core/state.js";
import { $, formatHr } from "../core/helpers.js";
import { renderOpenings } from "../calculations/openings.js";
import { refreshRoomsList } from "../calculations/rooms.js";
import { calculateAuto } from "../calculations/autoCalc.js";
import { applyPricesObject } from "../calculations/cjenik.js";
import { deleteCloudRecord } from "./cloudDelete.js";

export async function loadArchive() {
  const listDiv = $("#archiveList");
  if (!listDiv) return;

  listDiv.innerHTML = "Učitavam...";

  try {
    const snap = await db.collection("obracuni").orderBy("timestamp", "desc").get();
    if (snap.empty) {
      listDiv.innerHTML = "<p class='hint'>Arhiva je prazna.</p>";
      return;
    }

    let html = "";
    snap.forEach(doc => {
      const d = doc.data();
      const m = d.meta || {};
      const date = new Date(d.timestamp || 0);
      const dStr = `${String(date.getDate()).padStart(2,"0")}.${String(date.getMonth()+1).padStart(2,"0")}.${date.getFullYear()}.`;

      html += `
        <div class="rooms-list-item">
          <b>${m.siteName || "-"} – ${m.roomName || "-"}</b><br>
          <span class="hint">Situacija: ${m.situationNo || "-"} • ${dStr}</span>
          <div class="rooms-actions" style="margin-top:6px;">
            <button class="btn-small secondary" data-id="${doc.id}" data-action="load">📄 Učitaj</button>
            <button class="btn-small secondary" data-id="${doc.id}" data-action="delete">🗑 Obriši</button>
          </div>
        </div>
      `;
    });

    listDiv.innerHTML = html;

    listDiv.querySelectorAll("button").forEach(btn => {
      const id = btn.dataset.id;
      const action = btn.dataset.action;

      if (action === "load") {
        btn.addEventListener("click", () => reloadFromCloud(id));
      } else if (action === "delete") {
        btn.addEventListener("click", () => deleteCloudRecord(id));
      }
    });

  } catch (e) {
    console.error(e);
    listDiv.innerHTML = "Greška pri učitavanju arhive.";
  }
}

export async function reloadFromCloud(id) {
  try {
    const docSnap = await db.collection("obracuni").doc(id).get();
    if (!docSnap.exists) {
      alert("Dokument ne postoji.");
      return;
    }

    const d = docSnap.data();
    const m = d.meta || {};
    const rooms = d.rooms || [];
    const firstRoom = rooms[0] || null;

    // osnovni podaci o gradilištu
    $("#siteName").value     = m.siteName || "";
    $("#roomName").value     = m.roomName || "";
    $("#situationNo").value  = m.situationNo || "";
    $("#investorName").value = m.investorName || "";

    // format pločica
    if (m.tileFormat?.wcm && m.tileFormat?.hcm) {
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

    // dimenzije + otvori
    if (firstRoom) {
      $("#dimD").value = String(firstRoom.D).replace(".", ",");
      $("#dimS").value = String(firstRoom.S).replace(".", ",");
      $("#dimV").value = String(firstRoom.V).replace(".", ",");

      AppState.openings = (firstRoom.openings || []).map(o => ({ ...o }));
      renderOpenings();
    }

    AppState.siteRooms = rooms.map(r => ({ ...r }));
    refreshRoomsList();

    if (d.pricesTemplate) {
      applyPricesObject(d.pricesTemplate);
    }

    // prikaži autoCalc view i izračunaj
    document.querySelectorAll(".view").forEach(v => v.style.display = "none");
    $("#autoCalcView").style.display = "block";

    calculateAuto();
    alert("Obračun učitan iz Cloud-a.");

  } catch (e) {
    console.error(e);
    alert("Greška pri učitavanju iz Clouda: " + e.message);
  }
}
