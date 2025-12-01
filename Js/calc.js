// JS/calc.js

function kobParseNum(v) {
  if (v == null) return 0;
  const s = String(v).trim().replace(",", ".");
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

function kobFmt(n) {
  return (Math.round(n * 1000) / 1000).toString().replace(".", ",");
}

function buildCalcView() {
  const root = document.getElementById("calcContainer");
  if (!root) return;

  root.innerHTML = `
    <div class="calc-section">
      <div class="section-title">📏 Osnovne dimenzije prostorije</div>
      <div class="calc-grid">
        <div class="calc-field">
          <div class="calc-label">Duljina D (m)</div>
          <input id="dimD" placeholder="npr. 4,20">
        </div>
        <div class="calc-field">
          <div class="calc-label">Širina Š (m)</div>
          <input id="dimS" placeholder="npr. 3,10">
        </div>
        <div class="calc-field">
          <div class="calc-label">Visina V (m)</div>
          <input id="dimV" placeholder="npr. 2,65">
        </div>
      </div>
    </div>

    <div class="calc-section">
      <div class="section-title">➕ Dodatne dimenzije (izbočine, niše...)</div>
      <p class="small-text">
        Svaki red je dodatni dio prostorije. Pozitivan (+) dodaje površinu/opseg, negativan (−) oduzima.
      </p>
      <div id="extraDims"></div>
      <button class="btn-secondary" onclick="addExtraDimRow()">➕ Dodaj red dodatnih dimenzija</button>
    </div>

    <div class="calc-section">
      <div class="section-title">✅ Što se računa?</div>
      <div class="checkbox-row">
        <span>Pod (m²)</span><input type="checkbox" id="chkPod" checked>
      </div>
      <div class="checkbox-row">
        <span>Zidovi (m²)</span><input type="checkbox" id="chkZidovi" checked>
      </div>
      <div class="checkbox-row">
        <span>Hidroizolacija poda (m²)</span><input type="checkbox" id="chkHidroPod">
      </div>
      <div class="checkbox-row">
        <span>Hidro traka (m)</span><input type="checkbox" id="chkHidroTraka">
      </div>
      <div class="checkbox-row">
        <span>Silikon (m)</span><input type="checkbox" id="chkSilikon">
      </div>
    </div>

    <div class="calc-section">
      <div class="section-title">🪟 Otvori i elementi (silikon / lajsne / gerung)</div>
      <p class="small-text">
        Vrata se ne računaju u silikon. Prozori, geberiti i vertikale ulaze u silikon i po želji u lajsne / gerung.
      </p>

      <h4>Prozori</h4>
      <div class="checkbox-row">
        <span>Broj prozora</span>
        <input id="brProzora" value="0">
      </div>
      <div id="prozoriRows"></div>

      <h4>Geberit</h4>
      <div class="checkbox-row">
        <span>Broj geberita</span>
        <input id="brGeberita" value="0">
      </div>
      <div id="geberitRows"></div>

      <h4>Vertikale</h4>
      <div class="checkbox-row">
        <span>Broj vertikala</span>
        <input id="brVertikala" value="0">
      </div>
      <div id="vertikalaRows"></div>

      <h4>Vrata (info)</h4>
      <p class="small-text">Vrata se ne računaju u silikon (samo informativno):</p>
      <div class="checkbox-row">
        <span>Broj vrata</span>
        <input id="brVrata" value="0">
      </div>
    </div>

    <div class="calc-section">
      <button class="btn-primary" onclick="runCalc()">🔍 Izračunaj</button>
    </div>

    <div id="calcResultCard" class="result-card hidden">
      <h3>Rezultat obračuna</h3>
      <div id="calcResultHtml"></div>
    </div>
  `;

  addExtraDimRow();
  document.getElementById("brProzora").addEventListener("input", rebuildProzoriRows);
  document.getElementById("brGeberita").addEventListener("input", rebuildGeberitRows);
  document.getElementById("brVertikala").addEventListener("input", rebuildVertikalaRows);
}

function addExtraDimRow() {
  const c = document.getElementById("extraDims");
  if (!c) return;
  const row = document.createElement("div");
  row.className = "extra-row";
  row.innerHTML = `
    <input class="exD" placeholder="d (m)">
    <input class="exS" placeholder="š (m)">
    <input class="exV" placeholder="v (m)">
    <select class="exSign">
      <option value="+">+</option>
      <option value="-">−</option>
    </select>
    <button onclick="this.parentNode.remove()">✕</button>
  `;
  c.appendChild(row);
}

/* PROZORI / GEBERIT / VERTIKALE */

function rebuildProzoriRows() {
  const n = Math.max(0, parseInt(kobParseNum(document.getElementById("brProzora").value)));
  const c = document.getElementById("prozoriRows");
  c.innerHTML = "";
  for (let i = 1; i <= n; i++) {
    const div = document.createElement("div");
    div.className = "extra-row";
    div.innerHTML = `
      <input id="prozorV${i}" placeholder="visina (m)">
      <input id="prozorS${i}" placeholder="širina (m)">
      <label class="small-text" style="grid-column:span 2;">
        <input type="checkbox" id="prozorLajsna${i}"> Lajsna
      </label>
      <label class="small-text" style="grid-column:span 2;">
        <input type="checkbox" id="prozorGerung${i}"> Gerung
      </label>
    `;
    c.appendChild(div);
  }
}

function rebuildGeberitRows() {
  const n = Math.max(0, parseInt(kobParseNum(document.getElementById("brGeberita").value)));
  const c = document.getElementById("geberitRows");
  c.innerHTML = "";
  for (let i = 1; i <= n; i++) {
    const div = document.createElement("div");
    div.className = "extra-row";
    div.innerHTML = `
      <input id="geberitV${i}" placeholder="visina (m)">
      <input id="geberitS${i}" placeholder="širina (m)">
      <label class="small-text" style="grid-column:span 2;">
        <input type="checkbox" id="geberitLajsna${i}"> Lajsna
      </label>
      <label class="small-text" style="grid-column:span 2;">
        <input type="checkbox" id="geberitGerung${i}"> Gerung
      </label>
    `;
    c.appendChild(div);
  }
}

function rebuildVertikalaRows() {
  const n = Math.max(0, parseInt(kobParseNum(document.getElementById("brVertikala").value)));
  const c = document.getElementById("vertikalaRows");
  c.innerHTML = "";
  for (let i = 1; i <= n; i++) {
    const div = document.createElement("div");
    div.className = "extra-row";
    div.innerHTML = `
      <input id="vertikalaV${i}" placeholder="visina (m)">
      <label class="small-text" style="grid-column:span 2;">
        <input type="checkbox" id="vertikalaLajsna${i}"> Lajsna
      </label>
      <label class="small-text" style="grid-column:span 2;">
        <input type="checkbox" id="vertikalaGerung${i}"> Gerung
      </label>
    `;
    c.appendChild(div);
  }
}

/* GLAVNI IZRAČUN */

function runCalc() {
  const D = kobParseNum(document.getElementById("dimD").value);
  const S = kobParseNum(document.getElementById("dimS").value);
  const V = kobParseNum(document.getElementById("dimV").value);

  if (!D || !S || !V) {
    alert("Unesi D, Š i V.");
    return;
  }

  const chkPod = document.getElementById("chkPod").checked;
  const chkZid = document.getElementById("chkZidovi").checked;
  const chkHidro = document.getElementById("chkHidroPod").checked;
  const chkTraka = document.getElementById("chkHidroTraka").checked;
  const chkSil = document.getElementById("chkSilikon").checked;

  const rows = document.querySelectorAll("#extraDims .extra-row");
  let extraPod = 0;
  let extraZid = 0;
  let extraHidro = 0;
  let extraTraka = 0;
  let extraSil = 0;

  rows.forEach(r => {
    const dE = kobParseNum(r.querySelector(".exD").value);
    const sE = kobParseNum(r.querySelector(".exS").value);
    const vE = kobParseNum(r.querySelector(".exV").value);
    if (!dE && !sE && !vE) return;
    const sign = (r.querySelector(".exSign").value === "-") ? -1 : 1;

    const deltaPod = sign * (dE + sE);                // +/− (d+š)
    const deltaZid = sign * ((2 * dE + sE) * vE);     // +/− (2d+š)*v
    const deltaTraka = sign * (2 * dE + sE);          // +/− (2d+š)
    const deltaSil = sign * ((2 * dE + sE) + 2 * vE); // +/− (2d+š+2v)

    extraPod += deltaPod;
    extraZid += deltaZid;
    extraHidro += deltaPod;
    extraTraka += deltaTraka;
    extraSil += deltaSil;
  });

  let html = "";
  const results = {};

  // POD
  if (chkPod) {
    const base = D * S;
    const total = base + extraPod;
    results.pod = total;
    html += `<b>Pod:</b><br>`;
    html += `Osnovno: D×Š = ${kobFmt(D)}×${kobFmt(S)} = ${kobFmt(base)} m²<br>`;
    if (extraPod !== 0) html += `Dodatne dimenzije: ${extraPod > 0 ? "+" : ""}${kobFmt(extraPod)} m²<br>`;
    html += `Ukupno pod = <b>${kobFmt(total)} m²</b><br><br>`;
  }

  // ZIDOVI
  if (chkZid) {
    const base = 2 * (D * V) + 2 * (S * V);
    const total = base + extraZid;
    results.zidovi = total;
    html += `<b>Zidovi:</b><br>`;
    html += `Bruto: 2(D×V)+2(Š×V) = 2(${kobFmt(D)}×${kobFmt(V)}) + 2(${kobFmt(S)}×${kobFmt(V)}) = ${kobFmt(base)} m²<br>`;
    if (extraZid !== 0) html += `Dodatne dimenzije: ${extraZid > 0 ? "+" : ""}${kobFmt(extraZid)} m²<br>`;
    html += `Neto zidovi = <b>${kobFmt(total)} m²</b><br><br>`;
  }

  // HIDRO POD
  if (chkHidro) {
    const base = D * S;
    const total = base + extraHidro;
    results.hidroPod = total;
    html += `<b>Hidroizolacija poda:</b><br>`;
    html += `Osnovno: ${kobFmt(base)} m²<br>`;
    if (extraHidro !== 0) html += `Dodatne dimenzije: ${extraHidro > 0 ? "+" : ""}${kobFmt(extraHidro)} m²<br>`;
    html += `Ukupno hidro pod = <b>${kobFmt(total)} m²</b><br><br>`;
  }

  // HIDRO TRAKA
  if (chkTraka) {
    const base = 2 * D + 2 * S + 2 * V;
    const total = base + extraTraka;
    results.hidroTraka = total;
    html += `<b>Hidro traka:</b><br>`;
    html += `Osnovno: 2D+2Š+2V = 2${kobFmt(D)} + 2${kobFmt(S)} + 2${kobFmt(V)} = ${kobFmt(base)} m<br>`;
    if (extraTraka !== 0) html += `Dodatne dimenzije: ${extraTraka > 0 ? "+" : ""}${kobFmt(extraTraka)} m<br>`;
    html += `Ukupno traka = <b>${kobFmt(total)} m</b><br><br>`;
  }

  // SILIKON + LAJSNE + GERUNG
  if (chkSil) {
    const base = 2 * D + 2 * S + 4 * V;
    const silikonBase = base + extraSil;
    const parts = izracunSilikonLajsneGerung();
    const silikonOtvor = parts.silOpenings;
    const lajsne = parts.lajsneUkupno;
    const gerung = parts.gerungUkupno;
    const silikonTotal = silikonBase + silikonOtvor;

    results.silikon = silikonTotal;
    results.lajsne = lajsne;
    results.gerung = gerung;

    html += `<b>Silikon:</b><br>`;
    html += `Osnovni opseg (2D+2Š+4V) + dodatne dimenzije = ${kobFmt(silikonBase)} m<br>`;
    html += `Otvori (prozori / geberiti / vertikale) = ${kobFmt(silikonOtvor)} m<br>`;
    html += `Ukupno silikon = <b>${kobFmt(silikonTotal)} m</b><br><br>`;

    html += `<b>Lajsne:</b> ${kobFmt(lajsne)} m<br>`;
    html += `<b>Gerung:</b> ${kobFmt(gerung)} m<br><br>`;
  }

  const resEl = document.getElementById("calcResultHtml");
  const card = document.getElementById("calcResultCard");
  resEl.innerHTML = html || "Nema rezultata.";
  card.classList.remove("hidden");

  window.lastCalc = {
    dimensions: { D, S, V },
    extras: { extraPod, extraZid, extraHidro, extraTraka, extraSil },
    results
  };
}

/* izračun silikona / lajsni / gerunga za otvore */

function izracunSilikonLajsneGerung() {
  let silOpenings = 0;
  let lajsneUkupno = 0;
  let gerungUkupno = 0;

  // PROZORI
  const brProzora = Math.max(0, parseInt(kobParseNum(document.getElementById("brProzora").value)));
  for (let i = 1; i <= brProzora; i++) {
    const v = kobParseNum(document.getElementById(`prozorV${i}`)?.value);
    const s = kobParseNum(document.getElementById(`prozorS${i}`)?.value);
    if (!v && !s) continue;
    const duljina = 2 * v + s;
    silOpenings += duljina;
    const chkLajsna = document.getElementById(`prozorLajsna${i}`)?.checked;
    const chkGerung = document.getElementById(`prozorGerung${i}`)?.checked;
    if (chkLajsna) lajsneUkupno += duljina;
    if (chkGerung) gerungUkupno += duljina;
  }

  // GEBERIT
  const brGeberita = Math.max(0, parseInt(kobParseNum(document.getElementById("brGeberita").value)));
  for (let i = 1; i <= brGeberita; i++) {
    const v = kobParseNum(document.getElementById(`geberitV${i}`)?.value);
    const s = kobParseNum(document.getElementById(`geberitS${i}`)?.value);
    if (!v && !s) continue;
    const duljina = 2 * v + s; // 2x visina + širina
    silOpenings += duljina;
    const chkLajsna = document.getElementById(`geberitLajsna${i}`)?.checked;
    const chkGerung = document.getElementById(`geberitGerung${i}`)?.checked;
    if (chkLajsna) lajsneUkupno += duljina;
    if (chkGerung) gerungUkupno += duljina;
  }

  // VERTIKALE
  const brVertikala = Math.max(0, parseInt(kobParseNum(document.getElementById("brVertikala").value)));
  for (let i = 1; i <= brVertikala; i++) {
    const v = kobParseNum(document.getElementById(`vertikalaV${i}`)?.value);
    if (!v) continue;
    const duljina = v; // samo visina
    silOpenings += duljina;
    const chkLajsna = document.getElementById(`vertikalaLajsna${i}`)?.checked;
    const chkGerung = document.getElementById(`vertikalaGerung${i}`)?.checked;
    if (chkLajsna) lajsneUkupno += duljina;
    if (chkGerung) gerungUkupno += duljina;
  }

  // VRATA namjerno ignoriramo za silikon / lajsne / gerung

  return { silOpenings, lajsneUkupno, gerungUkupno };
    }
