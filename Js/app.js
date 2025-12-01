// JS/app.js

// global state
window.kobState = {
  prices: null
};

function showAuthView() {
  document.getElementById("authView").classList.remove("hidden");
  document.getElementById("appView").classList.add("hidden");
}

function showAppView() {
  document.getElementById("authView").classList.add("hidden");
  document.getElementById("appView").classList.remove("hidden");
  showSection("menu");
}

// prebacivanje sekcija unutar app-a
function showSection(section) {
  const ids = ["menu", "calc", "manual", "costs", "prices", "projects", "archive"];
  ids.forEach(id => {
    const el = document.getElementById(id + "View");
    if (!el) return;
    if (id === section) el.classList.remove("hidden");
    else el.classList.add("hidden");
  });

  if (section === "calc") buildCalcView();
  if (section === "costs") buildCostsView();
  if (section === "prices") buildPricesView();
  if (section === "projects") buildProjectsView();
  if (section === "archive") buildArchiveView();
}

/* ===== AUTH ===== */

function registerUser() {
  const email = document.getElementById("regEmail").value.trim();
  const pass = document.getElementById("regPass").value.trim();
  if (!email || !pass) {
    alert("Unesi email i lozinku.");
    return;
  }
  if (pass.length < 6) {
    alert("Lozinka mora imati barem 6 znakova.");
    return;
  }
  auth.createUserWithEmailAndPassword(email, pass)
    .then(() => alert("Registracija uspješna! Sada se prijavi."))
    .catch(err => alert("Greška: " + err.message));
}

function loginUser() {
  const email = document.getElementById("loginEmail").value.trim();
  const pass = document.getElementById("loginPass").value.trim();
  if (!email || !pass) {
    alert("Unesi email i lozinku.");
    return;
  }
  auth.signInWithEmailAndPassword(email, pass)
    .catch(err => alert("Greška: " + err.message));
}

function logoutUser() {
  auth.signOut();
}

auth.onAuthStateChanged(user => {
  if (user) {
    showAppView();
    const label = document.getElementById("userEmailLabel");
    if (label) label.textContent = user.email || "";
    loadPrices();
  } else {
    showAuthView();
  }
});

/* ===== FIRESTORE KOLEKCIJE ===== */

function projectsCollection() {
  return db.collection("projects");
}
function archiveCollection() {
  return db.collection("archive");
}
function pricesCollection() {
  return db.collection("prices");
}
function costsCollection() {
  return db.collection("costs");
}

/* ===== PROJEKTI ===== */

async function buildProjectsView() {
  const container = document.getElementById("projectsContainer");
  if (!container) return;
  const user = auth.currentUser;
  if (!user) {
    container.innerHTML = "<p>Prijavi se za projekte.</p>";
    return;
  }

  let html = `
    <div class="card">
      <h3>Novi projekt</h3>
      <input id="projName" placeholder="Naziv projekta / gradilišta">
      <input id="projInvest" placeholder="Investitor (opcionalno)">
      <input id="projPlace" placeholder="Lokacija / grad (opcionalno)">
      <button class="btn-primary" onclick="createProject()">Spremi projekt</button>
    </div>
    <div class="card">
      <h3>Postojeći projekti</h3>
  `;

  const snap = await projectsCollection()
    .where("userId", "==", user.uid)
    .orderBy("createdAt", "desc")
    .get();

  if (snap.empty) {
    html += `<p class="small-text">Još nemaš spremljenih projekata.</p></div>`;
    container.innerHTML = html;
    return;
  }

  snap.forEach(doc => {
    const d = doc.data();
    const created = d.createdAt && d.createdAt.toDate
      ? d.createdAt.toDate().toLocaleString("hr-HR")
      : "";
    html += `
      <div class="list-item">
        <div class="list-item-header">
          <span>${d.name || "Bez naziva"}</span>
          <span class="small-text">${created}</span>
        </div>
        <div class="small-text">Investitor: ${d.investor || "-"}</div>
        <div class="small-text">Lokacija: ${d.place || "-"}</div>
        <div class="list-item-actions">
          <button onclick="openProject('${doc.id}')">Otvori</button>
          <button onclick="archiveProject('${doc.id}')">Arhiviraj</button>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

async function createProject() {
  const user = auth.currentUser;
  if (!user) return;
  const name = document.getElementById("projName").value.trim();
  const investor = document.getElementById("projInvest").value.trim();
  const place = document.getElementById("projPlace").value.trim();
  if (!name) {
    alert("Unesi naziv projekta.");
    return;
  }
  await projectsCollection().add({
    userId: user.uid,
    name,
    investor,
    place,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  document.getElementById("projName").value = "";
  document.getElementById("projInvest").value = "";
  document.getElementById("projPlace").value = "";
  buildProjectsView();
}

function openProject(projectId) {
  alert("Otvaranje projekta – detaljna razrada situacija i graðevinske knjige će koristiti trenutni kalkulator.\nID: " + projectId);
}

async function archiveProject(projectId) {
  const user = auth.currentUser;
  if (!user) return;
  const docRef = projectsCollection().doc(projectId);
  const snap = await docRef.get();
  if (!snap.exists) {
    alert("Projekt ne postoji.");
    return;
  }
  const data = snap.data();
  await archiveCollection().add({
    ...data,
    projectId,
    archivedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  await docRef.delete();
  alert("Projekt arhiviran.");
  buildProjectsView();
  buildArchiveView();
}

/* ===== ARHIVA ===== */

async function buildArchiveView() {
  const container = document.getElementById("archiveContainer");
  if (!container) return;
  const user = auth.currentUser;
  if (!user) {
    container.innerHTML = "<p>Prijavi se za arhivu.</p>";
    return;
  }

  let html = `<div class="card"><h3>Arhivirani projekti</h3>`;
  const snap = await archiveCollection()
    .where("userId", "==", user.uid)
    .orderBy("archivedAt", "desc")
    .get();

  if (snap.empty) {
    html += `<p class="small-text">Nema arhiviranih projekata.</p></div>`;
    container.innerHTML = html;
    return;
  }

  snap.forEach(doc => {
    const d = doc.data();
    const archived = d.archivedAt && d.archivedAt.toDate
      ? d.archivedAt.toDate().toLocaleString("hr-HR")
      : "";
    html += `
      <div class="list-item">
        <div class="list-item-header">
          <span>${d.name || "Bez naziva"}</span>
          <span class="small-text">${archived}</span>
        </div>
        <div class="small-text">Investitor: ${d.investor || "-"}</div>
        <div class="small-text">Lokacija: ${d.place || "-"}</div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

/* ===== TROŠKOVI ===== */

async function buildCostsView() {
  const container = document.getElementById("costsContainer");
  if (!container) return;
  const user = auth.currentUser;
  if (!user) {
    container.innerHTML = "<p>Prijavi se za unos troškova.</p>";
    return;
  }

  let html = `
    <div class="card">
      <h3>Novi trošak</h3>
      <input id="costWorker" placeholder="Radnik">
      <input id="costAmount" placeholder="Iznos (EUR)">
      <textarea id="costDesc" placeholder="Opis troška"></textarea>
      <button class="btn-primary" onclick="addCost()">Spremi trošak</button>
    </div>
    <div class="card">
      <h3>Pregled troškova</h3>
      <input id="costFilter" placeholder="Filter po radniku (prazno = svi)">
      <button class="btn-secondary" onclick="loadCosts()">Osvježi</button>
      <div id="costsList" style="margin-top:10px;"></div>
    </div>
  `;
  container.innerHTML = html;
  loadCosts();
}

async function addCost() {
  const user = auth.currentUser;
  if (!user) return;
  const worker = document.getElementById("costWorker").value.trim();
  const amount = parseFloat((document.getElementById("costAmount").value || "").replace(",", "."));
  const desc = document.getElementById("costDesc").value.trim();
  if (!worker || isNaN(amount)) {
    alert("Unesi radnika i iznos.");
    return;
  }
  await costsCollection().add({
    userId: user.uid,
    worker,
    amount,
    desc,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  document.getElementById("costWorker").value = "";
  document.getElementById("costAmount").value = "";
  document.getElementById("costDesc").value = "";
  loadCosts();
}

async function loadCosts() {
  const user = auth.currentUser;
  if (!user) return;
  const filter = (document.getElementById("costFilter").value || "").trim().toLowerCase();
  const listEl = document.getElementById("costsList");
  if (!listEl) return;

  const snap = await costsCollection()
    .where("userId", "==", user.uid)
    .orderBy("createdAt", "desc")
    .limit(100)
    .get();

  if (snap.empty) {
    listEl.innerHTML = "<p class='small-text'>Nema unesenih troškova.</p>";
    return;
  }

  let total = 0;
  let totalFilt = 0;
  let html = "";
  snap.forEach(doc => {
    const d = doc.data();
    const w = d.worker || "";
    const a = d.amount || 0;
    const desc = d.desc || "";
    const match = !filter || w.toLowerCase().includes(filter);
    total += a;
    if (!match) return;
    totalFilt += a;
    const dt = d.createdAt && d.createdAt.toDate
      ? d.createdAt.toDate().toLocaleString("hr-HR")
      : "";
    html += `
      <div class="cost-row">
        <span><b>${w}</b> – ${a.toFixed(2)} €</span>
        <span class="small-text">${dt}</span>
        <span class="small-text">${desc}</span>
      </div>`;
  });

  listEl.innerHTML =
    `<p class="small-text">Ukupno svi troškovi: ${total.toFixed(2)} €</p>` +
    (filter ? `<p class="small-text">Za filter "${filter}": ${totalFilt.toFixed(2)} €</p>` : "") +
    html;
}

/* ===== CJENIK ===== */

async function buildPricesView() {
  const container = document.getElementById("pricesContainer");
  if (!container) return;
  const user = auth.currentUser;
  if (!user) {
    container.innerHTML = "<p>Prijavi se za cjenik.</p>";
    return;
  }

  const p = kobState.prices || {};
  const get = (k) => (p[k] != null ? String(p[k]).replace(".", ",") : "");

  container.innerHTML = `
    <div class="card">
      <h3>Cjenik (po jedinici)</h3>
      <p class="small-text">Ove cijene se koriste u obračunu i građevinskoj knjizi.</p>
      <div class="price-row">
        <span>Zidovi (€/m²)</span>
        <input id="priceZidovi" value="${get("zidovi")}">
      </div>
      <div class="price-row">
        <span>Pod (€/m²)</span>
        <input id="pricePod" value="${get("pod")}">
      </div>
      <div class="price-row">
        <span>Hidro pod (€/m²)</span>
        <input id="priceHidroPod" value="${get("hidroPod")}">
      </div>
      <div class="price-row">
        <span>Hidro traka (€/m)</span>
        <input id="priceHidroTraka" value="${get("hidroTraka")}">
      </div>
      <div class="price-row">
        <span>Silikon (€/m)</span>
        <input id="priceSilikon" value="${get("silikon")}">
      </div>
      <div class="price-row">
        <span>Sokl (€/m)</span>
        <input id="priceSokl" value="${get("sokl")}">
      </div>
      <div class="price-row">
        <span>Lajsne (€/m)</span>
        <input id="priceLajsne" value="${get("lajsne")}">
      </div>
      <div class="price-row">
        <span>Gerung (€/m)</span>
        <input id="priceGerung" value="${get("gerung")}">
      </div>
      <div class="price-row">
        <span>Stepenice (€/kom)</span>
        <input id="priceStepenice" value="${get("stepenice")}">
      </div>
      <button class="btn-primary" onclick="savePrices()">Spremi cjenik</button>
    </div>
  `;
}

async function loadPrices() {
  const user = auth.currentUser;
  if (!user) return;
  const docRef = pricesCollection().doc(user.uid);
  const snap = await docRef.get();
  if (snap.exists) {
    kobState.prices = snap.data();
  } else {
    kobState.prices = {};
  }
}

async function savePrices() {
  const user = auth.currentUser;
  if (!user) return;
  const docRef = pricesCollection().doc(user.uid);

  const parsePrice = (id) => {
    const v = (document.getElementById(id).value || "").replace(",", ".");
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
  };

  const data = {
    userId: user.uid,
    zidovi: parsePrice("priceZidovi"),
    pod: parsePrice("pricePod"),
    hidroPod: parsePrice("priceHidroPod"),
    hidroTraka: parsePrice("priceHidroTraka"),
    silikon: parsePrice("priceSilikon"),
    sokl: parsePrice("priceSokl"),
    lajsne: parsePrice("priceLajsne"),
    gerung: parsePrice("priceGerung"),
    stepenice: parsePrice("priceStepenice")
  };

  await docRef.set(data, { merge: true });
  kobState.prices = data;
  alert("Cjenik spremljen.");
}

/* INIT */

document.addEventListener("DOMContentLoaded", () => {
  showAuthView();
});
