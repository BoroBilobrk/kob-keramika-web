// js/calculations/autoCalc.js
import { state } from "../core/state.js";
import { parseNum, formatHr } from "../core/helpers.js";
import { openingArea, openingPerim } from "./openings.js";
import { UNIT_PRICES } from "./cjenik.js";

function readMeta() {
  const siteName     = document.getElementById("siteName").value.trim();
  const roomName     = document.getElementById("roomName").value.trim();
  const situationNo  = document.getElementById("situationNo").value.trim();
  const investorName = document.getElementById("investorName").value.trim();

  let tileFormat = null;
  const select = document.getElementById("tileFormatSelect");
  const fmt = select.value;

  if (fmt && fmt !== "custom") {
    const [wcm, hcm] = fmt.split("x").map(Number);
    tileFormat = { wcm, hcm, label: `${wcm} × ${hcm} cm` };
  } else if (fmt === "custom") {
    const wcm = parseNum(document.getElementById("tileW").value);
    const hcm = parseNum(document.getElementById("tileH").value);
    tileFormat = { wcm, hcm, label: `${wcm} × ${hcm} cm` };
  }

  return { siteName, roomName, situationNo, investorName, tileFormat };
}

export function runAutoCalc(showHtml = false) {
  const meta = readMeta();

  const D = parseNum(document.getElementById("dimD").value);
  const S = parseNum(document.getElementById("dimS").value);
  const V = parseNum(document.getElementById("dimV").value);

  const chkPod     = document.getElementById("chkPod").checked;
  const chkZidovi  = document.getElementById("chkZidovi").checked;
  const chkHidro   = document.getElementById("chkHidro").checked;
  const chkSilikon = document.getElementById("chkSilikon").checked;
  const chkSokl    = document.getElementById("chkSokl").checked;
  const chkGerung  = document.getElementById("chkGerung").checked;
  const chkDodatne = document.getElementById("chkDodatne").checked;

  const results = {};
  const prices  = {};
  let html = `<b>Izračun prostorije:</b><br>`;

  // Pod
  if (chkPod) {
    const pod = D * S;
    results.pod = pod;
    html += `<b>Pod:</b> ${formatHr(pod)} m²<br>`;
    prices.pod = { qty: pod, unit: "m2", price: UNIT_PRICES.pod };
  }

  // Zidovi
  if (chkZidovi) {
    const obod = 2 * (D + S);
    let bruto = obod * V;
    let minus = 0;
    state.openings.forEach(o => {
      if (o.subtract) minus += openingArea(o);
    });
    const neto = bruto - minus;
    results.zidoviNeto = neto;
    html += `<b>Zidovi:</b><br>`;
    html += `Bruto = ${formatHr(bruto)} m²<br>`;
    html += `Minus vrata = ${formatHr(minus)} m²<br>`;
    html += `Neto = <b>${formatHr(neto)} m²</b><br><br>`;
    prices.zidovi = { qty: neto, unit: "m2", price: UNIT_PRICES.zidovi };
  }

  // Hidro
  if (chkHidro) {
    const hidroPod = D * S;
    const hidroTus = S * V;
    let traka = 2 * (D + S);
    state.openings.forEach(o => {
      if (o.type === "prozor" || o.type === "nisa") traka += openingPerim(o);
    });
    results.hidroPod   = hidroPod;
    results.hidroTus   = hidroTus;
    results.hidroTraka = traka;
    html += `<b>Hidroizolacija:</b><br>`;
    html += `Pod = ${formatHr(hidroPod)} m²<br>`;
    html += `Tuš zona = ${formatHr(hidroTus)} m²<br>`;
    html += `Traka = ${formatHr(traka)} m<br><br>`;
    prices.hidroPod   = { qty: hidroPod,   unit: "m2", price: UNIT_PRICES.hidroPod };
    prices.hidroTus   = { qty: hidroTus,   unit: "m2", price: UNIT_PRICES.hidroTus };
    prices.hidroTraka = { qty: traka,      unit: "m",  price: UNIT_PRICES.hidroTraka };
  }

  // Silikon
  if (chkSilikon) {
    let m = 2 * (D + S);
    state.openings.forEach(o => {
      if (o.type === "prozor" || o.type === "nisa") m += openingPerim(o);
    });
    results.silikon = m;
    html += `<b>Silikon:</b> ${formatHr(m)} m<br><br>`;
    prices.silikon = { qty: m, unit: "m", price: UNIT_PRICES.silikon };
  }

  // Sokl
  if (chkSokl) {
    const m = 2 * (D + S);
    results.sokl = m;
    html += `<b>Sokl:</b> ${formatHr(m)} m<br><br>`;
    prices.sokl = { qty: m, unit: "m", price: UNIT_PRICES.sokl };
  }

  // Lajsne/Gerung (ovdje tretiramo kao lajsne)
  if (chkGerung) {
    let perim = 0;
    state.openings.forEach(o => {
      if (["prozor","nisa","geberit","vert"].includes(o.type))
        perim += openingPerim(o);
    });
    results.lajsne = perim;
    html += `<b>Lajsne / Gerung:</b> ${formatHr(perim)} m<br><br>`;
    prices.lajsne = { qty: perim, unit: "m", price: UNIT_PRICES.lajsne };
  }

  // Dodatne mjere
  if (chkDodatne) {
    const dmContainer = document.getElementById("dmContainer");
    const rows = dmContainer.querySelectorAll(".dm-row");
    let total = 0;
    const dmRows = [];

    rows.forEach(row => {
      const name = row.querySelector(".dmName").value || "";
      const val  = parseNum(row.querySelector(".dmVal").value);
      const sign = row.querySelector(".dmSign").value;
      const signedVal = sign === "-" ? -val : val;
      total += signedVal;
      dmRows.push({ name, val, sign, signedVal });
    });

    results.dm = { total, rows: dmRows };
    html += `<b>Dodatne mjere:</b><br>`;
    dmRows.forEach((r, i) => {
      html += `${i+1}. ${r.name}: ${r.sign}${formatHr(r.val)} ⇒ ${formatHr(r.signedVal)}<br>`;
    });
    html += `Ukupno = <b>${formatHr(total)}</b><br><br>`;
  }

  const data = {
    D, S, V,
    meta,
    openings: JSON.parse(JSON.stringify(state.openings)),
    results,
    prices
  };

  state.lastCalc = data;

  if (showHtml) {
    const out = document.getElementById("calcOutput");
    out.innerHTML = html;
    document.getElementById("calcResult").style.display = "block";
  }

  return data;
}
