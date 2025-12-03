// JS/calc.js

/* ===== POMOĆNE FUNKCIJE ===== */

function kobParseNum(v) {
  if (v == null) return 0;
  const s = String(v).trim().replace(",", ".");
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

function kobFmt(n) {
  return (Math.round(n * 1000) / 1000).toString().replace(".", ",");
}

/* ===== GLOBAL STATE ZA OTVORE ===== */

window.kobOpenings = []; // {id,type,label,w,h,count,subtractWalls,forSilicone,forTape,forLajsne,forGerung}

/* ===== GLAVNI UI ZA OBRAČUN ===== */

function buildCalcView() {
  const root = document.getElementById("calcContainer");
  if (!root) return;

  window.kobOpenings = [];

  root.innerHTML = `
    <div class="calc-section">
      <button class="btn-primary" onclick="runCalc()">🔍 Izračunaj sve</button>
      <p class="small-text" style="margin-top:4px;">
        Nakon izračuna će se prikazati detaljan pregled mjera i količina. PDF / CSV može se nadograditi na temelju rezultata.
      </p>
    </div>

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

    <div class="openings-section">
      <div class="openings-header">
        <div class="openings-title">🪟 Otvori (vrata, prozori, niše, geberit, vertikale)</div>
        <div class="openings-subtitle">
          Dodaj otvore i odaberi da li odbijaju zidove, ulaze u silikon, hidro traku, lajsne i gerung.
        </div>
      </div>

      <div class="openings-toolbar">
        <button onclick="addOpening('vrata')">
          <span class="icon">🚪</span><span>Vrata</span>
        </button>
        <button onclick="addOpening('prozor')">
          <span class="icon">🪟</span><span>Prozor</span>
        </button>
        <button onclick="addOpening('nisa')">
          <span class="icon">🧱</span><span>Niša</span>
        </button>
        <button onclick="addOpening('geberit')">
          <span class="icon">🚽</span><span>Geberit</span>
        </button>
        <button onclick="addOpening('vertikala')">
          <span class="icon">↕️</span><span>Vertikala</span>
        </button>
        <button onclick="addOpening('custom')">
          <span class="icon">✏️</span><span>Custom</span>
        </button>
      </div>

      <div id="openingsList" class="openings-list"></div>
    </div>

    <div id="calcResultCard" class="result-card hidden">
      <h3>Rezultat obračuna</h3>
      <div id="calcResultHtml"></div>
    </div>
  `;

  addExtraDimRow();
}

/* ===== DODATNE DIMENZIJE ===== */

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

/* ===== OTVORI – DODAVANJE / RENDER ===== */

function addOpening(type) {
  const id = "op_" + Date.now() + "_" + Math.random().toString(36).slice(2);
  let label = "";
  let defaults = {};

  switch (type) {
    case "vrata":
      label = "Vrata";
      defaults = {
        subtractWalls: true,
        forSilicone: false,
        forTape: false,
        forLajsne: false,
        forGerung: false
      };
      break;
    case "prozor":
      label = "Prozor";
      defaults = {
        subtractWalls: true,
        forSilicone: true,
        forTape: true,
        forLajsne: true,
        forGerung: true
      };
      break;
    case "nisa":
      label = "Niša";
      defaults = {
        subtractWalls: true,
        forSilicone: true,
        forTape: true,
        forLajsne: true,
        forGerung: true
      };
      break;
    case "geberit":
      label = "Geberit";
      defaults = {
        subtractWalls: true,
        forSilicone: true,
        forTape: true,
        forLajsne: true,
        forGerung: true
      };
      break;
    case "vertikala":
      label = "Vertikala";
      defaults = {
        subtractWalls: false,
        forSilicone: true,
        forTape: false,
        forLajsne: true,
        forGerung: true
      };
      break;
    default:
      label = "Custom";
      defaults = {
        subtractWalls: false,
        forSilicone: false,
        forTape: false,
        forLajsne: false,
        forGerung: false
      };
  }

  window.kobOpenings.push({
    id,
    type,
    label,
    w: 0,
    h: 0,
    count: 1,
    subtractWalls: defaults.subtractWalls,
    forSilicone: defaults.forSilicone,
    forTape: defaults.forTape,
    forLajsne: defaults.forLajsne,
    forGerung: defaults.forGerung
  });

  renderOpeningsList();
}

function renderOpeningsList() {
  const list = document.getElementById("openingsList");
  if (!list) return;

  if (!window.kobOpenings.length) {
    list.innerHTML = `<p class="small-text">Nema unesenih otvora.</p>`;
    return;
  }

  let html = "";
  window.kobOpenings.forEach(op => {
    const area = op.w * op.h * (op.count || 1);
    const perim = 2 * (op.w + op.h) * (op.count || 1);
    html += `
      <div class="opening-card">
        <div class="opening-header">
          <div>
            <div class="opening-type">${op.label}</div>
            <div class="opening-dims">${op.w ? kobFmt(op.w) : "?"} × ${op.h ? kobFmt(op.h) : "?"} m, kom: ${op.count}</div>
          </div>
          <button class="opening-delete-btn" onclick="deleteOpening('${op.id}')">Obriši</button>
        </div>
        <div class="opening-body">
          <input placeholder="š (m)" value="${op.w || ""}" 
                 oninput="updateOpeningField('${op.id}','w',this.value)">
          <input placeholder="v (m)" value="${op.h || ""}" 
                 oninput="updateOpeningField('${op.id}','h',this.value)">
          <input placeholder="kom" value="${op.count || ""}" 
                 oninput="updateOpeningField('${op.id}','count',this.value)">
        </div>
        <div class="opening-flags">
          <label class="opening-flag">
            <input type="checkbox" ${op.subtractWalls ? "checked" : ""} 
                   onchange="toggleOpeningFlag('${op.id}','subtractWalls',this.checked)">
            <span>Odbija zid</span>
          </label>
          <label class="opening-flag">
            <input type="checkbox" ${op.forSilicone ? "checked" : ""} 
                   onchange="toggleOpeningFlag('${op.id}','forSilicone',this.checked)">
            <span>Silikon</span>
          </label>
          <label class="opening-flag">
            <input type="checkbox" ${op.forTape ? "checked" : ""} 
                   onchange="toggleOpeningFlag('${op.id}','forTape',this.checked)">
            <span>Hidro traka</span>
          </label>
          <label class="opening-flag">
            <input type="checkbox" ${op.forLajsne ? "checked" : ""} 
                   onchange="toggleOpeningFlag('${op.id}','forLajsne',this.checked)">
            <span>Lajsne</span>
          </label>
          <label class="opening-flag">
            <input type="checkbox" ${op.forGerung ? "checked" : ""} 
                   onchange="toggleOpeningFlag('${op.id}','forGerung',this.checked)">
            <span>Gerung</span>
          </label>
        </div>
        <div class="opening-footer">
          <div>
            <span class="badge-pill">Površina: ${area ? kobFmt(area) : "0"} m²</span>
            <span class="badge-pill">Obod: ${perim ? kobFmt(perim) : "0"} m</span>
          </div>
        </div>
      </div>
    `;
  });

  list.innerHTML = html;
}

function deleteOpening(id) {
  window.kobOpenings = window.kobOpenings.filter(o => o.id !== id);
  renderOpeningsList();
}

function updateOpeningField(id, field, val) {
  const op = window.kobOpenings.find(o => o.id === id);
  if (!op) return;
  if (field === "count") {
    const n = parseInt(kobParseNum(val));
    op.count = isNaN(n) || n < 1 ? 1 : n;
  } else {
    op[field] = kobParseNum(val);
  }
  renderOpeningsList();
}

function toggleOpeningFlag(id, flag, checked) {
  const op = window.kobOpenings.find(o => o.id === id);
  if (!op) return;
  op[flag] = !!checked;
}

/* ===== GLAVNI IZRAČUN ===== */

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

  // DODATNE DIMENZIJE
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

    const deltaPod   = sign * (dE + sE);                // +/− (d+š)
    const deltaZid   = sign * ((2 * dE + sE) * vE);     // +/− (2d+š)*v
    const deltaTraka = sign * (2 * dE + sE);            // +/− (2d+š)
    const deltaSil   = sign * ((2 * dE + sE) + 2 * vE); // +/− (2d+š+2v)

    extraPod   += deltaPod;
    extraZid   += deltaZid;
    extraHidro += deltaPod;
    extraTraka += deltaTraka;
    extraSil   += deltaSil;
  });

  // DOPRINOS OTVORA
  let openingsAreaWalls = 0;
  let openingsSilicone = 0;
  let openingsTape = 0;
  let openingsLajsne = 0;
  let openingsGerung = 0;

  (window.kobOpenings || []).forEach(op => {
    const w = op.w || 0;
    const h = op.h || 0;
    const count = op.count || 1;

    if (!w || !h || !count) return;

    const area = w * h * count;
    const perim = 2 * (w + h) * count;

    // zidovi – odbijanje
    if (op.subtractWalls) {
      openingsAreaWalls += area;
    }

    // silikon
    if (op.forSilicone) {
      let silLen = perim;
      if (op.type === "geberit") {
        silLen = (2 * h + w) * count;
      } else if (op.type === "vertikala") {
        silLen = h * count;
      } else if (op.type === "vrata") {
        silLen = 0; // vrata ne ulaze u silikon
      }
      openingsSilicone += silLen;
    }

    // hidro traka
    if (op.forTape) {
      openingsTape += perim;
    }

    // lajsne
    if (op.forLajsne) {
      openingsLajsne += perim;
    }

    // gerung
    if (op.forGerung) {
      openingsGerung += perim;
    }
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
    const total = base + extraZid - openingsAreaWalls;
    results.zidovi = total;
    html += `<b>Zidovi:</b><br>`;
    html += `Bruto: 2(D×V)+2(Š×V) = 2(${kobFmt(D)}×${kobFmt(V)}) + 2(${kobFmt(S)}×${kobFmt(V)}) = ${kobFmt(base)} m²<br>`;
    if (extraZid !== 0) html += `Dodatne dimenzije: ${extraZid > 0 ? "+" : ""}${kobFmt(extraZid)} m²<br>`;
    if (openingsAreaWalls !== 0) html += `Oduzeti otvori: −${kobFmt(openingsAreaWalls)} m²<br>`;
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
    const total = base + extraTraka + openingsTape;
    results.hidroTraka = total;
    html += `<b>Hidro traka:</b><br>`;
    html += `Osnovno: 2D+2Š+2V = 2${kobFmt(D)} + 2${kobFmt(S)} + 2${kobFmt(V)} = ${kobFmt(base)} m<br>`;
    if (extraTraka !== 0) html += `Dodatne dimenzije: ${extraTraka > 0 ? "+" : ""}${kobFmt(extraTraka)} m<br>`;
    if (openingsTape !== 0) html += `Otvori (traka): +${kobFmt(openingsTape)} m<br>`;
    html += `Ukupno hidro traka = <b>${kobFmt(total)} m</b><br><br>`;
  }

  // SILIKON + LAJSNE + GERUNG
  if (chkSil) {
    const base = 2 * D + 2 * S + 4 * V;
    const silikonBase = base + extraSil;
    const silikonTotal = silikonBase + openingsSilicone;

    results.silikon = silikonTotal;
    results.lajsne = openingsLajsne;
    results.gerung = openingsGerung;

    html += `<b>Silikon:</b><br>`;
    html += `Osnovni opseg (2D+2Š+4V) + dodatne dimenzije = ${kobFmt(silikonBase)} m<br>`;
    if (openingsSilicone !== 0) {
      html += `Otvori (prozori / geberiti / vertikale / niše): +${kobFmt(openingsSilicone)} m<br>`;
    }
    html += `Ukupno silikon = <b>${kobFmt(silikonTotal)} m</b><br><br>`;

    html += `<b>Lajsne:</b> ${kobFmt(openingsLajsne)} m<br>`;
    html += `<b>Gerung:</b> ${kobFmt(openingsGerung)} m<br><br>`;
  }

  const resEl = document.getElementById("calcResultHtml");
  const card = document.getElementById("calcResultCard");
  resEl.innerHTML = html || "Nema rezultata.";
  card.classList.remove("hidden");

  window.lastCalc = {
    dimensions: { D, S, V },
    extras: { extraPod, extraZid, extraHidro, extraTraka, extraSil },
    openings: window.kobOpenings,
    openingsContrib: { openingsAreaWalls, openingsSilicone, openingsTape, openingsLajsne, openingsGerung },
    results
  };
    }
