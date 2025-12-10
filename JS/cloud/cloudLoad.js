// js/cloud/cloudLoad.js
import { db } from "./firebase-init.js";
import { state } from "../core/state.js";
import { renderOpenings } from "../calculations/openings.js";
import { refreshRoomsList } from "../calculations/rooms.js";
import { runAutoCalc } from "../calculations/autoCalc.js";

export async function loadArchive() {
  const listDiv = document.getElementById("archiveList");
  listDiv.innerHTML = "Učitavam...";

  try {
    const snap = await db.collection("obracuni").orderBy("timestamp", "desc").get();
    let html = "";

    snap.forEach(doc => {
      const d = doc.data();
      html += `
        <div class="opening-card">
          <div class="opening-title">${d.meta?.siteName || "-"} — ${d.meta?.roomName || "-"}</div>
          <div class="opening-meta">Situacija: ${d.meta?.situationNo || "-"}</div>
          <div class="row-actions">
            <button class="btn-small secondary" onclick="window.reloadFromCloud('${doc.id}')">📄 Otvori</button>
            <button class="btn-small secondary" onclick="window.deleteCloudRecord('${doc.id}')">🗑 Obriši</button>
          </div>
        </div>
      `;
    });

    listDiv.innerHTML = html || "<p class='hint'>Arhiva je prazna.</p>";
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
    const firstRoom = (d.rooms && d.rooms[0]) || null;

    document.getElementById("siteName").value     = m.siteName || "";
    document.getElementById("roomName").value     = m.roomName || "";
    document.getElementById("situationNo").value  = m.situationNo || "";
    document.getElementById("investorName").value = m.investorName || "";

    if (m.tileFormat && m.tileFormat.wcm && m.tileFormat.hcm) {
      const val = `${m.tileFormat.wcm}x${m.tileFormat.hcm}`;
      const select = document.getElementById("tileFormatSelect");
      const custom = document.getElementById("tileCustomFields");
      if ([...select.options].some(o => o.value === val)) {
        select.value = val;
        custom.style.display = "none";
      } else {
        select.value = "custom";
        custom.style.display = "block";
        document.getElementById("tileW").value = m.tileFormat.wcm;
        document.getElementById("tileH").value = m.tileFormat.hcm;
      }
    }

    if (firstRoom) {
      document.getElementById("dimD").value = String(firstRoom.D).replace(".", ",");
      document.getElementById("dimS").value = String(firstRoom.S).replace(".", ",");
      document.getElementById("dimV").value = String(firstRoom.V).replace(".", ",");

      state.openings = (firstRoom.openings || []).map(o => ({ ...o }));
      renderOpenings();
    }

    state.siteRooms = (d.rooms || []).map(r => ({ ...r }));
    refreshRoomsList();

    document.querySelectorAll(".view").forEach(v => v.style.display = "none");
    document.getElementById("autoCalcView").style.display = "block";

    runAutoCalc(true);
    alert("Obračun učitan iz Cloud-a.");
  } catch (e) {
    console.error(e);
    alert("Greška pri učitavanju: " + e.message);
  }
}
