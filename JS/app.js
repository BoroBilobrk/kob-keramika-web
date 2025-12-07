const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

let currentUserName = "";

// Extra dimenzije
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

// Otvori
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
      vert: "Vertikala"
    };
    const title = titleMap[type] || "Otvor";

    card.innerHTML = `
      <div class="opening-head">
        <div class="opening-title">${title}</div>
        <button type="button" class="btn-outline btn-small">Obriši</button>
      </div>
      <div class="grid-3" style="margin-top:4px;">
        <label>Širina (m)
          <input type="text" class="opW" placeholder="0,80">
        </label>
        <label>Visina (m)
          <input type="text" class="opH" placeholder="2,00">
        </label>
        <label>Količina (kom)
          <input type="text" class="opN" value="1">
        </label>
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

// Dodatne mjere
function initDmRows() {
  const container = document.getElementById("dmContainer");
  const btn = document.getElementById("btnAddDmRow");
  if (!container || !btn) return;

  function addRow() {
    const row = document.createElement("div");
    row.className = "dm-row";
    row.innerHTML = `
      <input type="text" class="dmName" placeholder="Opis">
      <input type="text" class="dmVal" placeholder="3,50">
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

// Očisti polja trenutne prostorije
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

// Očisti cijelu situaciju
function clearAll() {
  window.situationRooms.splice(0, window.situationRooms.length);
  window.situationItems.splice(0, window.situationItems.length);
  clearCurrentRoom();
  if (typeof renderRoomsTable === "function") renderRoomsTable();
}

// User name handling
function initUserName() {
  const input = document.getElementById("userNameInput");
  const badge = document.getElementById("userBadge");
  if (!input || !badge) return;

  function updateName() {
    currentUserName = input.value.trim();
    badge.textContent = currentUserName || "nema korisnika";
  }

  input.addEventListener("change", updateName);
  input.addEventListener("keyup", (e) => {
    if (e.key === "Enter") updateName();
  });
}

// Cloud arhiva – prikaz
async function reloadCloudArchive() {
  if (!currentUserName) {
    alert("Unesi ime korisnika (gore desno) prije učitavanja arhive.");
    return;
  }
  if (!window.firebaseLoadSituationsForUser) {
    alert("Firebase nije inicijaliziran.");
    return;
  }
  const container = document.getElementById("cloudArchiveList");
  container.innerHTML = "<div style='font-size:12px;opacity:0.8;'>Učitavanje...</div>";
  try {
    const docs = await window.firebaseLoadSituationsForUser(currentUserName);
    if (!docs.length) {
      container.innerHTML = "<div style='font-size:12px;opacity:0.8;'>Nema situacija u arhivi za ovog korisnika.</div>";
      return;
    }
    let html = "";
    docs.forEach(doc => {
      const meta = doc.meta || {};
      html += `
        <div class="cloud-item">
          <div class="cloud-item-header">
            <div><b>${meta.situationNo || ""}</b> – ${meta.siteName || ""}</div>
            <div class="cloud-item-meta">
              ${meta.workDesc || ""} · ${doc.createdAt || ""}
            </div>
          </div>
          <div class="cloud-item-actions">
            ${doc.pdfUrl ? `<a href="${doc.pdfUrl}" target="_blank" class="btn-outline btn-small" style="text-decoration:none;">📄 PDF</a>` : ""}
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
  } catch (err) {
    console.error(err);
    container.innerHTML = "<div style='font-size:12px;color:#ff5c5c;'>Greška pri učitavanju arhive.</div>";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initExtraDims();
  initOpenings();
  initDmRows();
  initUserName();

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
  const btnSaveCloud = document.getElementById("btnSaveCloud");
  const btnLoadArchive = document.getElementById("btnLoadArchive");

  if (btnCalcRoom) {
    btnCalcRoom.addEventListener("click", () => {
      const res = window.calcCurrentRoom();
      const out = document.getElementById("roomCalcOutput");
      out.innerHTML = window.renderRoomResultText(res);

      // Dodaj prostoriju u situaciju
      window.situationRooms.push(res);

      // Kreiraj stavke (po kategorijama) za PDF
      const siteName = document.getElementById("siteName").value.trim();
      const workDesc = document.getElementById("workDesc").value.trim();
      const baseRb = res.itemNo || (window.situationItems.length + 1).toString();

      function pushItem(suffix, desc, qty, unitKey) {
        if (!qty) return;
        const rb = baseRb + suffix;
        const unit = document.getElementById("defaultUnit").value.trim() || (unitKey === "m" ? "m" : "m2");
        window.situationItems.push({
          rb,
          desc: `${res.name} – ${desc}`,
          unit,
          qty,
          price: parseHr(document.getElementById("defaultPrice").value) || 0
        });
      }

      pushItem(".1", "Pod", res.pod, "m2");
      pushItem(".2", "Zidovi", res.zidovi, "m2");
      pushItem(".3", "Hidro pod", res.hidroPod, "m2");
      pushItem(".4", "Hidro traka", res.hidroTraka, "m");
      pushItem(".5", "Silikon", res.silikon, "m");
      pushItem(".6", "Sokl", res.sokl, "m");

      if (typeof renderRoomsTable === "function") renderRoomsTable();
    });
  }

  if (btnClearRoom) btnClearRoom.addEventListener("click", clearCurrentRoom);
  if (btnClearAll) btnClearAll.addEventListener("click", clearAll);
  if (btnExportPdf) btnExportPdf.addEventListener("click", () => window.exportPdf && window.exportPdf());
  if (btnExportCsv) btnExportCsv.addEventListener("click", () => window.exportCsv && window.exportCsv());
  if (btnLoadArchive) btnLoadArchive.addEventListener("click", reloadCloudArchive);

  if (btnSaveCloud) {
    btnSaveCloud.addEventListener("click", async () => {
      if (!currentUserName) {
        alert("Unesi ime korisnika (gore desno) prije spremanja u Cloud.");
        return;
      }
      if (!window.situationRooms.length) {
        alert("Nema dodanih prostorija u situaciju.");
        return;
      }
      if (!window.firebaseSaveSituation) {
        alert("Firebase nije inicijaliziran.");
        return;
      }

      const meta = {
        siteName: document.getElementById("siteName").value.trim(),
        workDesc: document.getElementById("workDesc").value.trim(),
        situationNo: document.getElementById("situationNo").value.trim(),
        unit: document.getElementById("defaultUnit").value.trim() || "m2",
        price: parseHr(document.getElementById("defaultPrice").value),
        note: document.getElementById("globalNote").value.trim()
      };
      const totals = window.calcSituationTotals();

      const situation = {
        meta,
        rooms: window.situationRooms.slice(),
        items: window.situationItems.slice(),
        totals
      };

      const doc = window.buildPdfFromSituation(situation);
      if (!doc) return;
      const pdfBlob = doc.output("blob");

      try {
        await window.firebaseSaveSituation(currentUserName, situation, pdfBlob);
        alert("Situacija je spremljena u Cloud.");
      } catch (err) {
        console.error(err);
        alert("Greška pri spremanju u Cloud.");
      }
      //-----------------------------------------------------
// LOGIN / AUTH / VIEW SWITCHER
//-----------------------------------------------------

function showView(id) {
  document.querySelectorAll(".view").forEach(v => v.style.display = "none");
  const el = document.getElementById(id);
  if (el) el.style.display = "block";
}

async function loginUser() {
  const email = document.getElementById("loginEmail").value.trim();
  const pass = document.getElementById("loginPass").value.trim();
  if (!email || !pass) {
    alert("Unesi email i lozinku.");
    return;
  }
  try {
    await firebase.auth().signInWithEmailAndPassword(email, pass);
  } catch (err) {
    alert("Neispravni podaci ili korisnik ne postoji.");
    console.error(err);
  }
}

async function registerUser() {
  const email = document.getElementById("regEmail").value.trim();
  const pass = document.getElementById("regPass").value.trim();
  if (!email || !pass) {
    alert("Unesi email i lozinku.");
    return;
  }
  try {
    await firebase.auth().createUserWithEmailAndPassword(email, pass);
    alert("Registracija uspješna. Možeš se prijaviti.");
  } catch (err) {
    alert("Greška pri registraciji.");
    console.error(err);
  }
}

async function logoutUser() {
  try {
    await firebase.auth().signOut();
  } catch (err) {
    console.error(err);
  }
}

function initAuthListener() {
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      // Kad je user prijavljen:
      showView("homeView");
      document.getElementById("loginView").style.display = "none";
      document.getElementById("logoutBtn").style.display = "inline-block";
    } else {
      // Kada NIJE prijavljen:
      showView("loginView");
      document.getElementById("logoutBtn").style.display = "none";
    }
  });
}

function initApp() {
  // Pokreni Auth Listener
  initAuthListener();

  // Prikaži login ekran na startu
  showView("loginView");
}

// Pokreni aplikaciju kada se stranica učita
document.addEventListener("DOMContentLoaded", initApp);
 // GLOBAL EXPORTS FOR HTML BUTTONS
window.loginUser = loginUser;
window.registerUser = registerUser;
window.logoutUser = logoutUser;
window.showView = showView;
    });
  }
});
