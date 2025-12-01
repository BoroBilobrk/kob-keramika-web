// JS/calc.js

// ---------- pomoćne funkcije ----------

function kobParseNum(v) {
  if (v === undefined || v === null) return 0;
  const s = String(v).trim().replace(",", ".");
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

function kobFormatNum(n) {
  return (Math.round(n * 1000) / 1000).toString().replace(".", ",");
}

// centralni state
const kobState = {
  lastCalc: null
};

// ---------- init svih view-ova ----------

function kobInitAllViews() {
  kobBuildCalcView();
  kobBuildTilesView();
  kobBuildBookView();
  kobBuildCostsView();
  // default view
  kobShowView("calc");
}

function kobShowView(viewName) {
  const views = {
    calc: document.getElementById("viewCalc"),
    tiles: document.getElementById("viewTiles"),
    book: document.getElementById("viewBook"),
    costs: document.getElementById("viewCosts")
  };
  Object.keys(views).forEach(k => {
    if (views[k]) views[k].classList.add("hidden");
  });
  if (views[viewName]) views[viewName].classList.remove("hidden");
}

// ---------- VIEW: PROSTORIJA / OBRAČUN ----------

function kobBuildCalcView() {
  const root = document.getElementById("viewCalc");
  if (!root) return;

  root.innerHTML = `
    <div class="card">
      <h3>Osnovne dimenzije prostorije</h3>
      <div class="calc-grid">
        <div>
          <div class="calc-label">Duljina D (m)</div>
          <input id="kobDimD" class="calc-input" placeholder="npr. 4,20">
        </div>
        <div>
          <div class="calc-label">Širina Š (m)</div>
          <input id="kobDimS" class="calc-input" placeholder="npr. 3,10">
        </div>
        <div>
          <div class="calc-label">Visina V (m)</div>
          <input id="kobDimV" class="calc-input" placeholder="npr. 2,65">
        </div>
      </div>
    </div>

    <div class="card">
      <h3>Dodatne dimenzije prostorije</h3>
      <p class="calc-label">
        Svaki red predstavlja dodatni dio prostorije (npr. uvučeni zid, proširenje).
        Utječe na pod, zidove, hidro pod, traku i silikon.
      </p>
      <div id="kobExtraDimsContainer"></div>
      <button id="kobBtnAddExtraDim">➕ Dodaj dodatne dimenzije</button>
    </div>

    <div class="card">
      <h3>Što računamo?</h3>
      <label class="calc-label"><input type="checkbox" id="kobChkPod" checked> Pod</label>
      <label class="calc-label"><input type="checkbox" id="kobChkZidovi" checked> Zidovi</label>
      <label class="calc-label"><input type="checkbox" id="kobChkHidroPod"> Hidroizolacija poda</label>
      <label class="calc-label"><input type="checkbox" id="kobChkHidroTraka"> Hidro traka</label>
      <label class="calc-label"><input type="checkbox" id="kobChkSilikon"> Silikon</label>
    </div>

    <div class="card">
      <button id="kobBtnCalcNow">🔍 Izračunaj</button>
    </div>

    <div id="kobCalcResult" class="card result-card hidden">
      <div class="result-title">Rezultati obračuna</div>
      <div id="kobCalcOutput"></div>
      <button id="kobBtnSaveToBook">💾 Spremi u građevinsku knjigu</button>
    </div>
  `;

  document.getElementById("kobBtnAddExtraDim")
    .addEventListener("click", kobAddExtraDimRow);

  // odmah jedan red
  kobAddExtraDimRow();

  document.getElementById("kobBtnCalcNow")
    .addEventListener("click", () => {
      try {
        kobRunAutoCalc();
      } catch (e) {
        console.error(e);
        alert("Greška u izračunu – provjeri unesene vrijednosti.");
      }
    });

  document.getElementById("kobBtnSaveToBook")
    .addEventListener("click", kobSaveLastCalcToBook);
}

function kobAddExtraDimRow() {
  const c = document.getElementById("kobExtraDimsContainer");
  if (!c) return;

  const row = document.createElement("div");
  row.className = "extra-row";
  row.innerHTML = `
    <input class="kobExD calc-input" placeholder="d (m)">
    <input class="kobExS calc-input" placeholder="š (m)">
    <input class="kobExV calc-input" placeholder="v (m)">
    <select class="kobExSign calc-input">
      <option value="+">+</option>
      <option value="-">−</option>
    </select>
    <button type="button">✕</button>
  `;
  row.querySelector("button").addEventListener("click", () => row.remove());
  c.appendChild(row);
}

function kobRunAutoCalc() {
  const D = kobParseNum(document.getElementById("kobDimD").value);
  const S = kobParseNum(document.getElementById("kobDimS").value);
  const V = kobParseNum(document.getElementById("kobDimV").value);

  const doPod   = document.getElementById("kobChkPod").checked;
  const doZid   = document.getElementById("kobChkZidovi").checked;
  const doHidro = document.getElementById("kobChkHidroPod").checked;
  const doTraka = document.getElementById("kobChkHidroTraka").checked;
  const doSil   = document.getElementById("kobChkSilikon").checked;

  if (!D || !S || !V) {
    alert("Unesi D, Š i V.");
    return;
  }

  let extraPod = 0;
  let extraHidro = 0;
  let extraZid = 0;
  let extraTraka = 0;
  let extraSil = 0;

  const rows = document.querySelectorAll("#kobExtraDimsContainer .extra-row");
  rows.forEach(row => {
    const dE = kobParseNum(row.querySelector(".kobExD").value);
    const sE = kobParseNum(row.querySelector(".kobExS").value);
    const vE = kobParseNum(row.querySelector(".kobExV").value);
    const sign = row.querySelector(".kobExSign").value === "-" ? -1 : 1;

    if (!dE && !sE && !vE) return;

    // tvoje logike:
    // Pod/Hidro pod: ±(d+š)
    const deltaPod = sign * (dE + sE);
    // Zid: +(2d+š)*v
    const deltaZid = sign * ((2 * dE + sE) * vE);
    // Traka: +(2d+š)
    const deltaTraka = sign * (2 * dE + sE);
    // Silikon: +(2d+š+2v)
    const deltaSil = sign * ((2 * dE + sE) + 2 * vE);

    extraPod += deltaPod;
    extraHidro += deltaPod;
    extraZid += deltaZid;
    extraTraka += deltaTraka;
    extraSil += deltaSil;
  });

  let html = "";
  const results = {};

  // POD
  if (doPod) {
    const a = D * S;
    const t = a + extraPod;
    results.pod = t;
    html += `<b>Pod:</b><br>`;
    html += `Osnovno: D×Š = ${kobFormatNum(D)}×${kobFormatNum(S)} = ${kobFormatNum(a)} m²<br>`;
    if (extraPod !== 0) {
      html += `Dodatne dimenzije: ${extraPod > 0 ? "+" : ""}${kobFormatNum(extraPod)} m²<br>`;
    }
    html += `Ukupno pod = <b>${kobFormatNum(t)} m²</b><br><br>`;
  }

  // ZIDOVI
  if (doZid) {
    const a = 2 * (D * V) + 2 * (S * V);
    const t = a + extraZid;
    results.zidovi = t;
    html += `<b>Zidovi:</b><br>`;
    html += `Bruto: 2(D×V) + 2(Š×V) = 2(${kobFormatNum(D)}×${kobFormatNum(V)}) + 2(${kobFormatNum(S)}×${kobFormatNum(V)}) = ${kobFormatNum(a)} m²<br>`;
    if (extraZid !== 0) {
      html += `Dodatne dimenzije: ${extraZid > 0 ? "+" : ""}${kobFormatNum(extraZid)} m²<br>`;
    }
    html += `Neto zidovi = <b>${kobFormatNum(t)} m²</b><br><br>`;
  }

  // HIDRO POD
  if (doHidro) {
    const a = D * S;
    const t = a + extraHidro;
    results.hidroPod = t;
    html += `<b>Hidroizolacija poda:</b><br>`;
    html += `Osnovno: ${kobFormatNum(a)} m²<br>`;
    if (extraHidro !== 0) {
      html += `Dodatne dimenzije: ${extraHidro > 0 ? "+" : ""}${kobFormatNum(extraHidro)} m²<br>`;
    }
    html += `Ukupno hidro pod = <b>${kobFormatNum(t)} m²</b><br><br>`;
  }

  // HIDRO TRAKA
  if (doTraka) {
    const a = 2 * D + 2 * S + 2 * V;
    const t = a + extraTraka;
    results.hidroTraka = t;
    html += `<b>Hidro traka:</b><br>`;
    html += `Osnovno: 2D + 2Š + 2V = 2${kobFormatNum(D)} + 2${kobFormatNum(S)} + 2${kobFormatNum(V)} = ${kobFormatNum(a)} m<br>`;
    if (extraTraka !== 0) {
      html += `Dodatne dimenzije: ${extraTraka > 0 ? "+" : ""}${kobFormatNum(extraTraka)} m<br>`;
    }
    html += `Ukupno traka = <b>${kobFormatNum(t)} m</b><br><br>`;
  }

  // SILIKON
  if (doSil) {
    const a = 2 * D + 2 * S + 4 * V;
    const t = a + extraSil;
    results.silikon = t;
    html += `<b>Silikon:</b><br>`;
    html += `Osnovni opseg: 2D + 2Š + 4V = 2${kobFormatNum(D)} + 2${kobFormatNum(S)} + 4${kobFormatNum(V)} = ${kobFormatNum(a)} m<br>`;
    if (extraSil !== 0) {
      html += `Dodatne dimenzije: ${extraSil > 0 ? "+" : ""}${kobFormatNum(extraSil)} m<br>`;
    }
    html += `Ukupno silikon = <b>${kobFormatNum(t)} m</b><br><br>`;
  }

  const out = document.getElementById("kobCalcOutput");
  const box = document.getElementById("kobCalcResult");
  out.innerHTML = html || "Nema rezultata za prikaz.";
  box.classList.remove("hidden");

  // spremi zadnji izračun u state za knjigu i pločice
  kobState.lastCalc = {
    D, S, V,
    results,
    timestamp: Date.now()
  };
}

// ---------- VIEW: PLOČICE ----------

function kobBuildTilesView() {
  const root = document.getElementById("viewTiles");
  if (!root) return;

  root.innerHTML = `
    <div class="card">
      <h3>Pločice – formati i količine</h3>
      <p class="small">
        Možeš koristiti zadnji izračun (pod/zidovi) ili unijeti ručno kvadraturu.
      </p>

      <div class="calc-grid">
        <div>
          <div class="calc-label">Površina (m²) – ručni unos</div>
          <input id="kobTilesAreaManual" class="calc-input" placeholder="npr. 25,5">
        </div>
        <div>
          <div class="calc-label">Ili koristi zadnji POD (m²)</div>
          <button id="kobBtnUseLastPod" type="button">Preuzmi POD</button>
        </div>
        <div>
          <div class="calc-label">Ili koristi zadnje ZIDOVE (m²)</div>
          <button id="kobBtnUseLastZidovi" type="button">Preuzmi ZIDOVE</button>
        </div>
      </div>
    </div>

    <div class="card">
      <h3>Format pločice</h3>
      <div class="calc-grid">
        <div>
          <div class="calc-label">Standardni formati</div>
          <select id="kobTileFormat" class="calc-input">
            <option value="30x60">30×60</option>
            <option value="60x60">60×60</option>
            <option value="80x80">80×80</option>
            <option value="100x100">100×100</option>
            <option value="60x120">60×120</option>
            <option value="120x120">120×120</option>
            <option value="100x300">100×300</option>
            <option value="120x280">120×280</option>
          </select>
        </div>
        <div>
          <div class="calc-label">Wastage (%)</div>
          <input id="kobTileWaste" class="calc-input" placeholder="npr. 10" value="10">
        </div>
      </div>

      <button id="kobBtnCalcTiles">📦 Izračunaj pločice</button>
    </div>

    <div id="kobTilesResult" class="card result-card hidden">
      <div class="result-title">Pločice – rezultat</div>
      <div id="kobTilesOutput"></div>
    </div>
  `;

  document.getElementById("kobBtnUseLastPod").addEventListener("click", () => {
    if (kobState.lastCalc && kobState.lastCalc.results.pod != null) {
      document.getElementById("kobTilesAreaManual").value =
        kobFormatNum(kobState.lastCalc.results.pod);
    } else {
      alert("Nema zadnjeg izračuna POD-a.");
    }
  });

  document.getElementById("kobBtnUseLastZidovi").addEventListener("click", () => {
    if (kobState.lastCalc && kobState.lastCalc.results.zidovi != null) {
      document.getElementById("kobTilesAreaManual").value =
        kobFormatNum(kobState.lastCalc.results.zidovi);
    } else {
      alert("Nema zadnjeg izračuna zidova.");
    }
  });

  document.getElementById("kobBtnCalcTiles").addEventListener("click", kobRunTilesCalc);
}

function kobRunTilesCalc() {
  const area = kobParseNum(document.getElementById("kobTilesAreaManual").value);
  const fmt = document.getElementById("kobTileFormat").value;
  const wastePct = kobParseNum(document.getElementById("kobTileWaste").value) || 0;

  if (!area) {
    alert("Unesi površinu (m²) ili koristi zadnji izračun.");
    return;
  }

  const [aStr, bStr] = fmt.split("x");
  const aCm = kobParseNum(aStr);
  const bCm = kobParseNum(bStr);
  const tileAreaM2 = (aCm / 100) * (bCm / 100);

  if (!tileAreaM2) {
    alert("Neispravan format pločice.");
    return;
  }

  const areaWithWaste = area * (1 + wastePct / 100);
  const tileCount = areaWithWaste / tileAreaM2;

  const outBox = document.getElementById("kobTilesResult");
  const out = document.getElementById("kobTilesOutput");

  out.innerHTML = `
    Površina: ${kobFormatNum(area)} m²<br>
    Format pločice: ${aCm}×${bCm} mm (≈ ${kobFormatNum(tileAreaM2)} m² po pločici)<br>
    Otpad: ${wastePct}% → obračunska površina: ${kobFormatNum(areaWithWaste)} m²<br><br>
    Potreban broj pločica ≈ <b>${kobFormatNum(tileCount)}</b> kom
  `;
  outBox.classList.remove("hidden");
}

// ---------- VIEW: GRAĐEVINSKA KNJIGA (osnova) ----------

function kobBuildBookView() {
  const root = document.getElementById("viewBook");
  if (!root) return;

  root.innerHTML = `
    <div class="card">
      <h3>Građevinska knjiga – spremanje situacije</h3>
      <p class="small">
        Sprema zadnji izračun prostorije u Cloud (Firestore) pod odabrano gradilište i situaciju.
      </p>
      <input id="kobBookGradiliste" placeholder="Naziv gradilišta">
      <input id="kobBookProstorija" placeholder="Naziv prostorije">
      <input id="kobBookSituacija" placeholder="Situacija (npr. 1)">
      <button id="kobBtnSaveBookEntry">💾 Spremi situaciju</button>
    </div>

    <div class="card">
      <h3>Moje situacije (zadnjih 5)</h3>
      <div id="kobBookList" class="small"></div>
      <button id="kobBtnReloadBook">🔄 Osvježi popis</button>
    </div>
  `;

  document.getElementById("kobBtnSaveBookEntry")
    .addEventListener("click", kobSaveBookEntry);

  document.getElementById("kobBtnReloadBook")
    .addEventListener("click", kobLoadBookEntries);

  // automatski učitaj
  kobLoadBookEntries();
}

async function kobSaveLastCalcToBook() {
  // poziva se iz calc view-a, ali samo pripremi polja u Book viewu
  if (!kobState.lastCalc) {
    alert("Nema zadnjeg izračuna za spremanje.");
    return;
  }
  alert("Otvori karticu 'Građevinska knjiga' i upiši podatke pa spremi situaciju.");
  kobShowView("book");
}

async function kobSaveBookEntry() {
  const user = firebase.auth().currentUser;
  if (!user) {
    alert("Nema prijavljenog korisnika.");
    return;
  }
  if (!kobState.lastCalc) {
    alert("Nema zadnjeg izračuna za spremanje.");
    return;
  }

  const gradiliste = document.getElementById("kobBookGradiliste").value.trim();
  const prostorija = document.getElementById("kobBookProstorija").value.trim();
  const situacija  = document.getElementById("kobBookSituacija").value.trim();

  if (!gradiliste || !prostorija || !situacija) {
    alert("Unesi gradilište, prostoriju i situaciju.");
    return;
  }

  try {
    await db.collection("users")
      .doc(user.uid)
      .collection("gradilista")
      .doc(gradiliste)
      .collection("situacije")
      .add({
        prostorija,
        situacija,
        calc: kobState.lastCalc,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

    alert("Situacija spremljena u građevinsku knjigu.");
    kobLoadBookEntries();
  } catch (e) {
    console.error(e);
    alert("Greška pri spremanju: " + e.message);
  }
}

async function kobLoadBookEntries() {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const listBox = document.getElementById("kobBookList");
  if (!listBox) return;

  listBox.innerHTML = "Učitavanje...";

  try {
    const snap = await db.collection("users")
      .doc(user.uid)
      .collection("gradilista")
      .get();

    let html = "";
    for (const docGrad of snap.docs) {
      const gradId = docGrad.id;
      const sitSnap = await docGrad.ref
        .collection("situacije")
        .orderBy("createdAt", "desc")
        .limit(5)
        .get();

      if (!sitSnap.empty) {
        html += `<b>${gradId}</b><br>`;
        sitSnap.forEach(sitDoc => {
          const d = sitDoc.data();
          const prostorija = d.prostorija || "";
          const situacija = d.situacija || "";
          const res = d.calc && d.calc.results ? d.calc.results : {};
          const pod = res.pod != null ? kobFormatNum(res.pod) + " m² pod" : "";
          const zid = res.zidovi != null ? kobFormatNum(res.zidovi) + " m² zidovi" : "";
          html += `&nbsp;&nbsp;- Situacija ${situacija} – ${prostorija} (${pod} ${pod && zid ? ", " : ""}${zid})<br>`;
        });
        html += `<br>`;
      }
    }
    listBox.innerHTML = html || "Nema spremljenih situacija.";
  } catch (e) {
    console.error(e);
    listBox.innerHTML = "Greška pri učitavanju.";
  }
}

// ---------- VIEW: TROŠKOVI ----------

function kobBuildCostsView() {
  const root = document.getElementById("viewCosts");
  if (!root) return;

  root.innerHTML = `
    <div class="card">
      <h3>Troškovi po radniku</h3>
      <input id="kobCostWorker" placeholder="Radnik (ime)">
      <input id="kobCostAmount" placeholder="Iznos (EUR)">
      <textarea id="kobCostDesc" placeholder="Opis troška"></textarea>
      <button id="kobBtnAddCost">➕ Dodaj trošak</button>
    </div>

    <div class="card">
      <h3>Popis troškova</h3>
      <input id="kobCostFilterWorker" placeholder="Filter po radniku (prazno = svi)">
      <button id="kobBtnRefreshCosts">🔄 Osvježi</button>
      <div id="kobCostsList" class="small"></div>
    </div>
  `;

  document.getElementById("kobBtnAddCost")
    .addEventListener("click", kobAddCost);

  document.getElementById("kobBtnRefreshCosts")
    .addEventListener("click", kobLoadCosts);

  // inicijalno učitavanje
  kobLoadCosts();
}

async function kobAddCost() {
  const user = firebase.auth().currentUser;
  if (!user) {
    alert("Moraš biti prijavljen.");
    return;
  }

  const radnik = document.getElementById("kobCostWorker").value.trim();
  const iznos  = kobParseNum(document.getElementById("kobCostAmount").value);
  const opis   = document.getElementById("kobCostDesc").value.trim();

  if (!radnik || !iznos) {
    alert("Unesi radnika i iznos.");
    return;
  }

  try {
    await db.collection("users")
      .doc(user.uid)
      .collection("troskovi")
      .add({
        radnik,
        iznos,
        opis,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    document.getElementById("kobCostAmount").value = "";
    document.getElementById("kobCostDesc").value = "";
    kobLoadCosts();
  } catch (e) {
    console.error(e);
    alert("Greška pri spremanju troška: " + e.message);
  }
}

async function kobLoadCosts() {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const filterWorker = document.getElementById("kobCostFilterWorker").value.trim().toLowerCase();
  const listBox = document.getElementById("kobCostsList");
  if (!listBox) return;

  listBox.innerHTML = "Učitavanje...";

  try {
    const snap = await db.collection("users")
      .doc(user.uid)
      .collection("troskovi")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    let totalAll = 0;
    let totalFiltered = 0;
    let html = "";

    snap.forEach(doc => {
      const d = doc.data();
      const radnik = d.radnik || "";
      const iznos = d.iznos || 0;
      const opis = d.opis || "";
      totalAll += iznos;

      const match = !filterWorker || radnik.toLowerCase().includes(filterWorker);
      if (match) {
        totalFiltered += iznos;
        html += `<div class="cost-row">
          <strong>${radnik}</strong> – ${kobFormatNum(iznos)} €
          <br><span class="small">${opis}</span>
        </div>`;
      }
    });

    html = `Ukupno svi troškovi: <b>${kobFormatNum(totalAll)} €</b><br>` +
           (filterWorker ? `Za filter "${filterWorker}": <b>${kobFormatNum(totalFiltered)} €</b><br><br>` : `<br>`) +
           (html || "Nema troškova za prikaz.");

    listBox.innerHTML = html;
  } catch (e) {
    console.error(e);
    listBox.innerHTML = "Greška pri učitavanju troškova.";
  }
}

// ---------- init DOMContentLoaded (za slučaj da smo prije auth-a) ----------

document.addEventListener("DOMContentLoaded", () => {
  // ništa specijalno ovdje – glavni init se radi kad se korisnik prijavi (u app.js)
});
