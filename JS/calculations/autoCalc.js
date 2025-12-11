// JS/calculations/autoCalc.js
import { AppState } from "../core/state.js";
import { $, parseNum, formatHr } from "../core/helpers.js";
import { getOpenings, openingArea, openingPerim } from "./openings.js";
import { UNIT_PRICES, readPricesFromInputs } from "./cjenik.js";

function readMeta() {
  const siteName     = $("#siteName").value.trim();
  const roomName     = $("#roomName").value.trim();
  const situationNo  = $("#situationNo").value.trim();
  const investorName = $("#investorName").value.trim();

  let tileFormat = null;
  const select = $("#tileFormatSelect");
  const fmt = select.value;

  if (fmt && fmt !== "custom") {
    const [wcm, hcm] = fmt.split("x").map(Number);
    tileFormat = { wcm, hcm, label: `${wcm} × ${hcm} cm` };
  } else if (fmt === "custom") {
    const wcm = parseNum($("#tileW").value);
    const hcm = parseNum($("#tileH").value);
    tileFormat = { wcm, hcm, label: `${wcm} × ${hcm} cm` };
  }

  return { siteName, roomName, situationNo, investorName, tileFormat };
}

export function runAutoCalc(showHtml = false) {
  readPricesFromInputs(); // uvijek svježe cijene

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
  const chkGerung     = $("#chkGerung").checked;
  const chkDodatne    = $("#chkDodatne").checked;
  const chkStepenice  = $("#chkStepenice").checked;

  const openings = getOpenings();
  const results = {};
  const prices  = {};
  let html = `<b>Izračun prostorije:</b><br>`;

  // 1. POD
  if (chkPod) {
    const pod = D * S;
    results.pod = pod;
    html += `<b>Pod:</b> ${formatHr(pod)} m²<br>`;
    if (UNIT_PRICES.pod)
      prices.pod = { qty: pod, unit: "m2", price: UNIT_PRICES.pod };
  }

  // 2. ZIDOVI
  if (chkZidovi) {
    const obod  = 2 * (D + S);
    const bruto = obod * V;
    let minusVrata = 0;
    openings.filter(o => o.kind === "door").forEach(o => minusVrata += openingArea(o));
    const neto = bruto - minusVrata;

    results.zidoviNeto = neto;

    html += `<b>Zidovi:</b><br>`;
    html += `Bruto = ${formatHr(bruto)} m²<br>`;
    html += `Minus vrata = ${formatHr(minusVrata)} m²<br>`;
    html += `Neto = <b>${formatHr(neto)} m²</b><br><br>`;

    if (UNIT_PRICES.zidovi)
      prices.zidovi = { qty: neto, unit: "m2", price: UNIT_PRICES.zidovi };
  }

  // 3. HIDRO (pod + tuš)
  if (chkHidro) {
    const hidroPod = D * S;
    const hidroTus = S * V;
    results.hidroPod = hidroPod;
    results.hidroTus = hidroTus;

    html += `<b>Hidroizolacija:</b><br>`;
    html += `Pod = ${formatHr(hidroPod)} m²<br>`;
    html += `Tuš zona = ${formatHr(hidroTus)} m²<br><br>`;

    if (UNIT_PRICES.hidroPod)
      prices.hidroPod = { qty: hidroPod, unit: "m2", price: UNIT_PRICES.hidroPod };
    if (UNIT_PRICES.hidroTus)
      prices.hidroTus = { qty: hidroTus, unit: "m2", price: UNIT_PRICES.hidroTus };
  }

  // 4. HIDRO TRAKA
  if (chkHidroTraka) {
    let traka = 2 * (D + S);
    openings.filter(o => o.kind === "window" || o.kind === "niche")
            .forEach(o => traka += openingPerim(o));
    results.hidroTraka = traka;

    html += `<b>Hidro traka:</b> ${formatHr(traka)} m<br><br>`;

    if (UNIT_PRICES.hidroTraka)
      prices.hidroTraka = { qty: traka, unit: "m", price: UNIT_PRICES.hidroTraka };
  }

  // 5. SILIKON
  if (chkSilikon) {
    let m = 2 * (D + S);
    openings.filter(o => o.kind === "window" || o.kind === "niche")
            .forEach(o => m += openingPerim(o));
    results.silikon = m;

    html += `<b>Silikon:</b> ${formatHr(m)} m<br><br>`;

    if (UNIT_PRICES.silikon)
      prices.silikon = { qty: m, unit: "m", price: UNIT_PRICES.silikon };
  }

  // 6. SOKL
  if (chkSokl) {
    const sokl = 2 * (D + S);
    results.sokl = sokl;

    html += `<b>Sokl:</b> ${formatHr(sokl)} m<br><br>`;

    if (UNIT_PRICES.sokl)
      prices.sokl = { qty: sokl, unit: "m", price: UNIT_PRICES.sokl };
  }

  // 7. LAJSNE / GERUNG
  if (chkGerung) {
    let lg = 0;
    openings.filter(o => ["window","niche","geberit","vert"].includes(o.kind))
            .forEach(o => lg += openingPerim(o));
    results.lajsne = lg;

    html += `<b>Lajsne / gerung:</b> ${formatHr(lg)} m<br><br>`;

    if (UNIT_PRICES.lajsne)
      prices.lajsne = { qty: lg, unit: "m", price: UNIT_PRICES.lajsne };
  }

  // 8. STEPENICE
  if (chkStepenice) {
    const stepM   = parseNum($("#stepM").value);
    const stepKom = parseNum($("#stepKom").value);
    results.stepM   = stepM;
    results.stepKom = stepKom;

    html += `<b>Stepenice:</b> ${formatHr(stepM)} m, ${formatHr(stepKom,0)} kom<br><br>`;
  }

  // 9. DODATNE MJERE
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
    html += `<b>Dodatne mjere:</b> ${formatHr(total)} (m/m² prema kontekstu)<br><br>`;
  }

  // FINANCIJE – brz zbroj
  let ukupno = 0;
  Object.keys(prices).forEach(k => {
    const p = prices[k];
    ukupno += p.qty * p.price;
  });
  if (ukupno > 0) {
    html += `<b>UKUPNO (informativno):</b> ${formatHr(ukupno, 2)} EUR<br>`;
  }

  const data = {
    D, S, V,
    meta,
    openings: [...openings],
    results,
    prices
  };

  AppState.lastCalc = data;

  if (showHtml) {
    $("#calcOutput").innerHTML = html;
    $("#calcResult").style.display = "block";
  }

  return data;
                               }
