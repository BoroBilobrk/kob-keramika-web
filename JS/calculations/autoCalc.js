// JS/calculations/autoCalc.js
import { AppState } from "../core/state.js";
import { $, parseNum, formatHr } from "../core/helpers.js";
import { getOpenings, openingArea, openingPerim } from "./openings.js";
import { UNIT_PRICES, readPricesFromInputs } from "./cjenik.js";

/* -------------------------------------------------------------
   META PODACI
------------------------------------------------------------- */
function readMeta() {
  const siteName     = $("#siteName").value.trim();
  const roomName     = $("#roomName").value.trim();
  const situationNo  = $("#situationNo").value.trim();
  const investorName = $("#investorName").value.trim();

  const contractValue         = parseNum($("#contractValue")?.value || "0");
  const previousSituationsTotal = parseNum($("#prevSituations")?.value || "0");

  let tileFormat = null;
  const select = $("#tileFormatSelect");
  const fmt = select.value;

  if (fmt && fmt !== "custom") {
    const [wcm, hcm] = fmt.split("x").map(Number);
    tileFormat = { wcm, hcm, label: `${wcm} × ${hcm} cm`, key: fmt };
  } else if (fmt === "custom") {
    const wcm = parseNum($("#tileW").value);
    const hcm = parseNum($("#tileH").value);
    tileFormat = { wcm, hcm, label: `${wcm} × ${hcm} cm`, key: "custom" };
  }

  return {
    siteName,
    roomName,
    situationNo,
    investorName,
    contractValue,
    previousSituationsTotal,
    tileFormat
  };
}

/* -------------------------------------------------------------
   GLAVNA FUNKCIJA
------------------------------------------------------------- */
export function runAutoCalc(showHtml = false) {
  // učitaj cjenik u UNIT_PRICES
  readPricesFromInputs();

  const meta = readMeta();

  const D = parseNum($("#dimD").value);
  const S = parseNum($("#dimS").value);
  const V = parseNum($("#dimV").value);

  const chkPod        = $("#chkPod").checked;
  const chkZidovi     = $("#chkZidovi").checked;
  const chkHidro      = $("#chkHidro").checked;
  const chkHidroTraka = $("#chkHidroTraka").checked;
  const chkSilikon    = $("#chkSilikon").checked;
  const chkSokl       = $("#chkSokl").checked;
  const chkLajsne     = $("#chkLajsne").checked;
  const chkGerung     = $("#chkGerung").checked;
  const chkDodatne    = $("#chkDodatne").checked;
  const chkStepenice  = $("#chkStepenice").checked;

  // spremimo checkboxe u meta da PDF zna što je uključeno
  meta.chkPod        = chkPod;
  meta.chkZidovi     = chkZidovi;
  meta.chkHidro      = chkHidro;
  meta.chkHidroTraka = chkHidroTraka;
  meta.chkSilikon    = chkSilikon;
  meta.chkSokl       = chkSokl;
  meta.chkLajsne     = chkLajsne;
  meta.chkGerung     = chkGerung;
  meta.chkDodatne    = chkDodatne;
  meta.chkStepenice  = chkStepenice;

  const openings = getOpenings();

  const results = {};
  const prices  = {};   // koristi se u PDF-u (jedinične cijene)
  let html = `<b>Izračun prostorije:</b><br>`;

  /* -------------------------------------------------------------
     1. POD
  ------------------------------------------------------------- */
  if (chkPod) {
    const pod = D * S;
    results.pod = pod;

    if (UNIT_PRICES.pod)
      prices.pod = { qty: pod, price: UNIT_PRICES.pod, unit: "m²" };

    html += `Pod: <b>${formatHr(pod)}</b> m²<br>`;
  }

  /* -------------------------------------------------------------
     2. ZIDOVI NETO
  ------------------------------------------------------------- */
  if (chkZidovi) {
    const bruto = 2 * (D + S) * V;
    let minusVrata = 0;

    openings
      .filter(o => o.kind === "door")
      .forEach(o => minusVrata += openingArea(o));

    const neto = bruto - minusVrata;
    results.zidoviNeto = neto;

    if (UNIT_PRICES.zidovi)
      prices.zidovi = { qty: neto, price: UNIT_PRICES.zidovi, unit: "m²" };

    html += `Zidovi neto: <b>${formatHr(neto)}</b> m²<br>`;
  }

  /* -------------------------------------------------------------
     3. HIDROIZOLACIJA (pod + tuš)
  ------------------------------------------------------------- */
  if (chkHidro) {
    const hidroPod = D * S;
    const hidroTus = S * V;

    results.hidroPod = hidroPod;
    results.hidroTus = hidroTus;

    if (UNIT_PRICES.hidroPod)
      prices.hidroPod = { qty: hidroPod, price: UNIT_PRICES.hidroPod, unit: "m²" };
    if (UNIT_PRICES.hidroTus)
      prices.hidroTus = { qty: hidroTus, price: UNIT_PRICES.hidroTus, unit: "m²" };

    html += `Hidro pod: ${formatHr(hidroPod)} m², tuš: ${formatHr(hidroTus)} m²<br>`;
  }

  /* -------------------------------------------------------------
     4. HIDRO TRAKA
  ------------------------------------------------------------- */
  if (chkHidroTraka) {
    let traka = 2 * (D + S);
    openings
      .filter(o => o.kind === "window" || o.kind === "niche")
      .forEach(o => traka += openingPerim(o));

    results.hidroTraka = traka;

    if (UNIT_PRICES.hidroTraka)
      prices.hidroTraka = { qty: traka, price: UNIT_PRICES.hidroTraka, unit: "m" };

    html += `Hidro traka: <b>${formatHr(traka)}</b> m<br>`;
  }

  /* -------------------------------------------------------------
     5. SILIKON
  ------------------------------------------------------------- */
  if (chkSilikon) {
    let m = 2 * (D + S);
    openings
      .filter(o => ["window", "niche"].includes(o.kind))
      .forEach(o => m += openingPerim(o));

    results.silikon = m;

    if (UNIT_PRICES.silikon)
      prices.silikon = { qty: m, price: UNIT_PRICES.silikon, unit: "m" };

    html += `Silikon: <b>${formatHr(m)}</b> m<br>`;
  }

  /* -------------------------------------------------------------
     6. SOKL
  ------------------------------------------------------------- */
  if (chkSokl) {
    const sokl = 2 * (D + S);
    results.sokl = sokl;

    if (UNIT_PRICES.sokl)
      prices.sokl = { qty: sokl, price: UNIT_PRICES.sokl, unit: "m" };

    html += `Sokl: <b>${formatHr(sokl)}</b> m<br>`;
  }

  /* -------------------------------------------------------------
     7. LAJSNE – samo ako je kvačica
  ------------------------------------------------------------- */
  if (chkLajsne) {
    let lajsneVal = 0;
    openings
      .filter(o => ["window", "niche", "geberit", "vert"].includes(o.kind))
      .forEach(o => lajsneVal += openingPerim(o));

    results.lajsne = lajsneVal;
    results.lajsneData = { baseL: 0, perimLajsne: lajsneVal };

    if (UNIT_PRICES.lajsne)
      prices.lajsne = { qty: lajsneVal, price: UNIT_PRICES.lajsne, unit: "m" };

    html += `Lajsne: <b>${formatHr(lajsneVal)}</b> m<br>`;
  } else {
    results.lajsne = 0;
    results.lajsneData = { baseL: 0, perimLajsne: 0 };
  }

  /* -------------------------------------------------------------
     8. GERUNG – samo ako je kvačica
  ------------------------------------------------------------- */
  if (chkGerung) {
    let gerungVal = 0;
    openings
      .filter(o => ["geberit", "vert"].includes(o.kind))
      .forEach(o => gerungVal += openingPerim(o));

    results.gerung = gerungVal;
    results.gerungData = { baseG: 0, perimGerung: gerungVal };

    if (UNIT_PRICES.gerung)
      prices.gerung = { qty: gerungVal, price: UNIT_PRICES.gerung, unit: "m" };

    html += `Gerung: <b>${formatHr(gerungVal)}</b> m<br>`;
  } else {
    results.gerung = 0;
    results.gerungData = { baseG: 0, perimGerung: 0 };
  }

  /* -------------------------------------------------------------
     9. DODATNE MJERE
  ------------------------------------------------------------- */
  if (chkDodatne) {
    const rows = [...document.querySelectorAll("#dmContainer .dm-row")];
    let total = 0;
    const list = [];

    rows.forEach(r => {
      const name = r.querySelector(".dmName")?.value || "";
      const val  = parseNum(r.querySelector(".dmVal")?.value);
      const sign = r.querySelector(".dmSign")?.value || "+";
      const signedVal = sign === "-" ? -val : val;
      total += signedVal;
      list.push({ name, val, sign, signedVal });
    });

    results.dm = { total, rows: list };
  }

  /* -------------------------------------------------------------
     10. STEPENICE
  ------------------------------------------------------------- */
  if (chkStepenice) {
    const stepM   = parseNum($("#stepM")?.value || "0");
    const stepKom = parseNum($("#stepKom")?.value || "0");

    results.stepM   = stepM;
    results.stepKom = stepKom;

    html += `Stepenice: ${formatHr(stepM)} m, ${formatHr(stepKom, 0)} kom<br>`;
  }

  /* -------------------------------------------------------------
     11. TOTAL PRICE ZA CIJELU PROSTORIJU
  ------------------------------------------------------------- */
  let totalPrice = 0;
  Object.values(prices).forEach(p => {
    totalPrice += p.qty * p.price;
  });

  const data = {
    D, S, V,
    meta,
    openings: [...openings],
    results,
    prices,
    totalPrice
  };

  AppState.lastCalc = data;

  if (showHtml) {
    html += `<br><b>UKUPNO:</b> ${formatHr(totalPrice)} EUR<br>`;
    $("#calcOutput").innerHTML = html;
    $("#calcResult").style.display = "block";
  }

  return data;
     }
