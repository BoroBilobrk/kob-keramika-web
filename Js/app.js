// JS/app.js

// ➜ 1. Firebase inicijalizacija
const firebaseConfig = {
  apiKey: "AIzaSyDIuDJqFE3G2yk98WPwGHkc6xomWXUdu3o",
  authDomain: "kob-keramika.firebaseapp.com",
  projectId: "kob-keramika",
  storageBucket: "kob-keramika.firebasestorage.app",
  messagingSenderId: "604488601212",
  appId: "1:604488601212:web:70552af260d9e5a283c3f9",
  measurementId: "G-KDTBSP3H39"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Globalni state
let currentUser = null;

// ➜ 2. Pomoćne funkcije UI
function showMessage(msg, isError = false) {
  const el = document.getElementById("authMessage");
  if (!el) return;
  el.textContent = msg || "";
  el.classList.toggle("error", !!isError);
}

function showView(id) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  const target = document.getElementById(id);
  if (target) target.classList.add("active");

  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.view === id);
  });
}

function updateAuthUI(user) {
  const statusEl = document.getElementById("userStatus");
  const logoutBtn = document.getElementById("btnLogout");
  const nav = document.getElementById("mainNav");
  const appContent = document.getElementById("appContent");

  if (user) {
    statusEl.textContent = user.email;
    logoutBtn.classList.remove("hidden");
    nav.classList.remove("hidden");
    appContent.classList.remove("hidden");
    showView("quickCalcView");
    loadProjects();
    loadArchive();
  } else {
    statusEl.textContent = "Nije prijavljen";
    logoutBtn.classList.add("hidden");
    nav.classList.add("hidden");
    appContent.classList.add("hidden");
  }
}

// ➜ 3. AUTH HANDLERI

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const pass = document.getElementById("loginPassword").value;

  try {
    await auth.signInWithEmailAndPassword(email, pass);
    showMessage("Prijava uspješna.");
  } catch (err) {
    console.error(err);
    showMessage("Greška pri prijavi: " + err.message, true);
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const email = document.getElementById("regEmail").value.trim();
  const pass = document.getElementById("regPassword").value;

  try {
    const cred = await auth.createUserWithEmailAndPassword(email, pass);
    // kreiraj osnovni user dokument
    await db.collection("users").doc(cred.user.uid).set({
      email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    showMessage("Registracija uspješna. Možete se prijaviti.");
  } catch (err) {
    console.error(err);
    showMessage("Greška pri registraciji: " + err.message, true);
  }
}

async function handleLogout() {
  try {
    await auth.signOut();
    showMessage("Odjava uspješna.");
  } catch (err) {
    console.error(err);
    showMessage("Greška pri odjavi: " + err.message, true);
  }
}

// ➜ 4. Firestore – PROJEKTI & ARHIVA

async function saveProjectFromLastCalc() {
  if (!currentUser) {
    alert("Prijavite se prije spremanja projekta.");
    return;
  }
  if (!window.lastCalc) {
    alert("Prvo napravite obračun.");
    return;
  }

  const site = document.getElementById("metaSite").value.trim();
  const room = document.getElementById("metaRoom").value.trim();
  const situation = Number(document.getElementById("metaSituation").value || 1);
  const tileFormat = document.getElementById("metaTileFormat").value || "";
  const unitPrice = Number(document.getElementById("metaUnitPrice").value || 0);

  const payload = {
    site: site || "Bez naziva",
    room: room || "Bez prostorije",
    situation,
    tileFormat,
    unitPrice,
    calc: window.lastCalc,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    await db.collection("users")
      .doc(currentUser.uid)
      .collection("projects")
      .add(payload);

    alert("Projekt spremljen.");
    loadProjects();
  } catch (err) {
    console.error(err);
    alert("Greška pri spremanju projekta: " + err.message);
  }
}

async function saveArchiveFromLastCalc() {
  if (!currentUser) {
    alert("Prijavite se prije spremanja u arhivu.");
    return;
  }
  if (!window.lastCalc) {
    alert("Prvo napravite obračun.");
    return;
  }

  const payload = {
    calc: window.lastCalc,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    await db.collection("users")
      .doc(currentUser.uid)
      .collection("archive")
      .add(payload);

    alert("Obračun spremljen u arhivu.");
    loadArchive();
  } catch (err) {
    console.error(err);
    alert("Greška pri spremanju u arhivu: " + err.message);
  }
}

async function loadProjects() {
  if (!currentUser) return;
  const ul = document.getElementById("projectList");
  if (!ul) return;
  ul.innerHTML = "<li>Učitavanje...</li>";

  try {
    const snap = await db.collection("users")
      .doc(currentUser.uid)
      .collection("projects")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    if (snap.empty) {
      ul.innerHTML = "<li>Nema spremljenih projekata.</li>";
      return;
    }

    ul.innerHTML = "";
    snap.forEach(doc => {
      const d = doc.data();
      const li = document.createElement("li");
      li.dataset.id = doc.id;
      const title = `${d.site || "Gradilište"} – ${d.room || "Prostorija"} (sit. ${d.situation || 1})`;
      const qty = d.calc && d.calc.summary
        ? d.calc.summary
        : "";
      li.innerHTML = `
        <strong>${title}</strong>
        <span class="meta">
          Format: ${d.tileFormat || "-"} · Jed. cijena: ${d.unitPrice || 0} €/m²
        </span>
        <span class="meta">${qty}</span>
      `;
      li.addEventListener("click", () => loadProjectIntoCalc(doc.id));
      ul.appendChild(li);
    });
  } catch (err) {
    console.error(err);
    ul.innerHTML = "<li>Greška pri učitavanju projekata.</li>";
  }
}

async function loadArchive() {
  if (!currentUser) return;
  const ul = document.getElementById("archiveList");
  if (!ul) return;
  ul.innerHTML = "<li>Učitavanje...</li>";

  try {
    const snap = await db.collection("users")
      .doc(currentUser.uid)
      .collection("archive")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    if (snap.empty) {
      ul.innerHTML = "<li>Arhiva je prazna.</li>";
      return;
    }

    ul.innerHTML = "";
    snap.forEach(doc => {
      const d = doc.data();
      const meta = d.calc && d.calc.meta ? d.calc.meta : {};
      const li = document.createElement("li");
      const title = `${meta.site || "Gradilište"} – ${meta.room || "Prostorija"} (sit. ${meta.situation || "-"})`;
      li.innerHTML = `
        <strong>${title}</strong>
        <span class="meta">${d.calc && d.calc.summary ? d.calc.summary : ""}</span>
      `;
      ul.appendChild(li);
    });
  } catch (err) {
    console.error(err);
    ul.innerHTML = "<li>Greška pri učitavanju arhive.</li>";
  }
}

async function loadProjectIntoCalc(docId) {
  if (!currentUser) return;
  try {
    const doc = await db.collection("users")
      .doc(currentUser.uid)
      .collection("projects")
      .doc(docId)
      .get();

    if (!doc.exists) return;
    const d = doc.data();

    if (d.calc && d.calc.dimensions) {
      const { D, S, V } = d.calc.dimensions;
      document.getElementById("dimD").value = D;
      document.getElementById("dimS").value = S;
      document.getElementById("dimV").value = V;
    }

    showView("quickCalcView");
  } catch (err) {
    console.error(err);
    alert("Greška pri učitavanju projekta: " + err.message);
  }
}

// ➜ 5. PDF & CSV eksport koristeći window.lastCalc (popunjava calc.js)

function exportPdfFromLastCalc() {
  if (!window.lastCalc || !window.lastCalc.text) {
    alert("Prvo napravi obračun.");
    return;
  }
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) {
    alert("PDF modul nije učitan.");
    return;
  }
  const doc = new jsPDF();
  const lines = window.lastCalc.text.split("\n");
  let y = 14;
  doc.setFontSize(12);
  doc.text("KOB-Keramika – Građevinska knjiga (sažetak)", 10, y);
  y += 8;
  doc.setFontSize(10);
  lines.forEach(line => {
    if (y > 280) {
      doc.addPage();
      y = 14;
    }
    doc.text(line, 10, y);
    y += 5;
  });
  doc.save("kob-keramika-obracun.pdf");
}

function exportCsvFromLastCalc() {
  if (!window.lastCalc || !window.lastCalc.rows) {
    alert("Prvo napravi obračun.");
    return;
  }
  const header = ["Naziv", "Vrijednost", "Jedinica"];
  const rows = window.lastCalc.rows;
  const csv = [header.join(",")]
    .concat(rows.map(r =>
      [r.name, String(r.value).replace(".", ","), r.unit || ""].join(",")
    ))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "kob-keramika-obracun.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ➜ 6. DOMContentLoaded – sve spajamo

document.addEventListener("DOMContentLoaded", () => {
  // auth
  document.getElementById("loginForm").addEventListener("submit", handleLogin);
  document.getElementById("registerForm").addEventListener("submit", handleRegister);
  document.getElementById("btnLogout").addEventListener("click", handleLogout);

  // nav
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => showView(btn.dataset.view));
  });

  // dodatne dimenzije (handler u calc.js koristi isti container, ali ovdje dodamo prvi red)
  if (typeof initCalcUI === "function") {
    initCalcUI();
  }

  document.getElementById("btnSaveProject").addEventListener("click", saveProjectFromLastCalc);
  document.getElementById("btnSaveArchive").addEventListener("click", saveArchiveFromLastCalc);
  document.getElementById("btnExportPdf").addEventListener("click", exportPdfFromLastCalc);
  document.getElementById("btnExportCsv").addEventListener("click", exportCsvFromLastCalc);

  // Firebase auth listener
  auth.onAuthStateChanged(user => {
    currentUser = user;
    updateAuthUI(user);
  });
});
