// JS/calc.js

// ------------ POMOĆNE FUNKCIJE ---------------

function kobParseNum(v) {
  if (v === undefined || v === null) return 0;
  const s = String(v).trim().replace(",", ".");
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

function kobFormatNum(n) {
  return (Math.round(n * 1000) / 1000).toString().replace(".", ",");
}

// ------------ GRADNJA UI-A --------------------

function kobBuildCalcUI() {
  const root = document.getElementById("calcContent");
  if (!root) return;

  root.innerHTML = `
    <div class="card">
      <h3>Osnovne dimenzije prostorije</h3>
      <div class="calc-grid">
        <div>
          <div class="calc-label">Duljina D (m)</div>
          <input id="kobDimD" class="calc-input" placeholder="npr. 4,20" />
        </div>
        <div>
          <div class="calc-label">Širina Š (m)</div>
          <input id="kobDimS" class="calc-input" placeholder="npr. 3,10" />
        </div>
        <div>
          <div class="calc-label">Visina V (m)</div>
          <input id="kobDimV" class="calc-input" placeholder="npr. 2,65" />
        </div>
      </div>
    </div>

    <div class="card">
      <h3>Dodatne dimenzije prostorije</h3>
      <p class="calc-label">
        Svaki red predstavlja dodatni dio prostorije (npr. uvučeni zid, proširenje).
        Utječe na pod, zidove, hidro, traku i silikon prema tvojim pravilima.
      </p>
      <div id="kobExtraDimsContainer"></div>
      <button id="kobBtnAddExtraDim" class="btn-primary">➕ Dodaj dodatne dimenzije</button>
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
      <button id="kobBtnCalcNow" class="btn-primary">🔍 Izračunaj</button>
    </div>

    <div id="kobCalcResult" class="card result-card" style="display:none;">
      <div class="result-title">Rezultati obračuna</div>
      <div id="kobCalcOutput"></div>
    </div>
  `;

  // event za dodavanje dodatnih dimenzija
  document.getElementById("kobBtnAddExtraDim")
    .addEventListener("click", kobAddExtraDimRow);

  // automatski dodaj jedan red
  kobAddExtraDimRow();

  // event za izračun
  document.getElementById("kobBtnCalcNow")
    .addEventListener("click", () => {
      try {
        kobRunAutoCalc();
      } catch (e) {
        console.error(e);
        alert("Greška u izračunu – provjeri unesene vrijednosti.");
      }
    });
}

function kobAddExtraDimRow() {
  const c = document.getElementById("kobExtraDimsContainer");
  if (!c) return;

  const row = document.createElement("div");
  row.className = "extra-row";
  row.innerHTML = `
    <input class="kobExD calc-input" placeholder="d (m)" />
    <input class="kobExS calc-input" placeholder="š (m)" />
    <input class="kobExV calc-input" placeholder="v (m)" />
    <select class="kobExSign calc-input">
      <option value="+">+</option>
      <option value="-">−</option>
    </select>
    <button type="button" class="btn-primary" style="width:auto;">✕</button>
  `;
  row.querySelector("button").addEventListener("click", () => row.remove());
  c.appendChild(row);
}

// ------------ GLAVNI IZRAČUN --------------------

function kobRunAutoCalc() {
  const D = kobParseNum(document.getElementById("kobDimD").value);
  const S = kobParseNum(document.getElementById("kobDimS").value);
  const V = kobParseNum(document.getElementById("kobDimV").value);

  const doPod   = document.getElementById("kobChkPod").checked;
  const doZid   = document.getElementById("kobChkZidovi").checked;
  const doHidro = document.getElementById("kobChkHidroPod").checked;
  const doTraka = document.getElementById("kobChkHidroTraka").checked;
  const doSil   = document.getElementById("kobChkSilikon").checked;

  let html = "";

  // bazne provjere
  if (!D || !S || !V) {
    alert("Unesi D, Š i V.");
    return;
  }

  // dodatne dimenzije – kumulativni doprinos
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

  // POD
  if (doPod) {
    const a = D * S;
    const t = a + extraPod;
    html += `<b>Pod:</b><br>`;
    html += `Osnovno: D×Š = ${kobFormatNum(D)}×${kobFormatNum(S)} = ${kobFormatNum(a)} m²<br>`;
    if (extraPod !== 0) {
      html += `Dodatne dimenzije: ${extraPod > 0 ? "+" : ""}${kobFormatNum(extraPod)} m²<br>`;
    }
    html += `Ukupno pod = <b>${kobFormatNum(t)} m²</b><br><br>`;
  }

  // ZIDOVI (bez otvora, s dodatnim dimenzijama)
  if (doZid) {
    const a = 2 * (D * V) + 2 * (S * V);
    const t = a + extraZid;
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
    html += `<b>Hidroizolacija poda:</b><br>`;
    html += `Osnovno: D×Š = ${kobFormatNum(D)}×${kobFormatNum(S)} = ${kobFormatNum(a)} m²<br>`;
    if (extraHidro !== 0) {
      html += `Dodatne dimenzije: ${extraHidro > 0 ? "+" : ""}${kobFormatNum(extraHidro)} m²<br>`;
    }
    html += `Ukupno hidro pod = <b>${kobFormatNum(t)} m²</b><br><br>`;
  }

  // HIDRO TRAKA
  if (doTraka) {
    const a = 2 * D + 2 * S + 2 * V;
    const t = a + extraTraka;
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
  box.style.display = "block";
}

// ------------ INIT -----------------------------

document.addEventListener("DOMContentLoaded", () => {
  // kad se DOM učita, izgradi UI unutar #calcContent
  kobBuildCalcUI();
});
