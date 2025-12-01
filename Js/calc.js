// JS/calc.js

// Pomoćne funkcije
function parseNumHr(value) {
  if (typeof value !== "string") value = String(value || "");
  value = value.replace(",", ".").trim();
  const n = parseFloat(value);
  return isNaN(n) ? 0 : n;
}

function formatHrNum(num, decimals = 3) {
  return Number(num).toFixed(decimals).replace(".", ",");
}

// globalno – zadnji obračun
window.lastCalc = null;

// inicijalni UI za dodatne dimenzije
function initCalcUI() {
  const container = document.getElementById("dmContainer");
  const btnAdd = document.getElementById("btnAddDmRow");
  const btnCalc = document.getElementById("btnCalc");

  function addRow() {
    const row = document.createElement("div");
    row.className = "dm-row";
    row.innerHTML = `
      <input type="text" class="dmD" placeholder="d (m)" />
      <input type="text" class="dmS" placeholder="š (m)" />
      <input type="text" class="dmV" placeholder="v (m)" />
      <select class="dmSign">
        <option value="+">+</option>
        <option value="-">−</option>
      </select>
      <button type="button" class="btn ghost small dmRemove">✕</button>
    `;
    row.querySelector(".dmRemove").addEventListener("click", () => {
      container.removeChild(row);
    });
    container.appendChild(row);
  }

  btnAdd.addEventListener("click", addRow);
  // jedan red za početak
  addRow();

  btnCalc.addEventListener("click", doQuickCalc);
}

// Glavna funkcija obračuna
function doQuickCalc() {
  const D = parseNumHr(document.getElementById("dimD").value);
  const S = parseNumHr(document.getElementById("dimS").value);
  const V = parseNumHr(document.getElementById("dimV").value);

  const chkPod = document.getElementById("chkPod").checked;
  const chkZidovi = document.getElementById("chkZidovi").checked;
  const chkHidroPod = document.getElementById("chkHidroPod").checked;
  const chkHidroTraka = document.getElementById("chkHidroTraka").checked;
  const chkSilikon = document.getElementById("chkSilikon").checked;

  if (!D || !S || !V) {
    alert("Unesi osnovne dimenzije D, Š i V.");
    return;
  }

  // osnovni izračuni
  const podOsnovno = D * S; // m2
  const zidoviBruto = 2 * (D * V) + 2 * (S * V); // m2
  const hidroPodOsnovno = podOsnovno; // m2
  const trakaOsnovno = 2 * D + 2 * S + 2 * V; // m
  const silikonOsnovno = 2 * D + 2 * S + 4 * V; // m

  // dodatne dimenzije
  const container = document.getElementById("dmContainer");
  const rows = container.querySelectorAll(".dm-row");
  let extraPod = 0;
  let extraZid = 0;
  let extraHidroPod = 0;
  let extraTraka = 0;
  let extraSilikon = 0;

  const dmDetails = [];

  rows.forEach((row, index) => {
    const d = parseNumHr(row.querySelector(".dmD").value);
    const s = parseNumHr(row.querySelector(".dmS").value);
    const v = parseNumHr(row.querySelector(".dmV").value);
    const sign = row.querySelector(".dmSign").value === "-" ? -1 : 1;

    if (!d && !s && !v) return;

    // tvoje specifikacije:
    // Pod:       ± (š + d)
    // Zid:       ± (2d + š) × v
    // Hidro pod: isto kao pod
    // Traka:     ± (2d + š)
    // Silikon:   ± [(2d + š) + 2v]
    const addPod = (s + d) * sign;
    const addZid = (2 * d + s) * v * sign;
    const addHidroPod = addPod;
    const addTraka = (2 * d + s) * sign;
    const addSilikon = ((2 * d + s) + 2 * v) * sign;

    extraPod += addPod;
    extraZid += addZid;
    extraHidroPod += addHidroPod;
    extraTraka += addTraka;
    extraSilikon += addSilikon;

    dmDetails.push({
      index: index + 1,
      d, s, v, sign: sign === -1 ? "-" : "+",
      addPod, addZid, addHidroPod, addTraka, addSilikon
    });
  });

  const results = {};
  const rowsForCsv = [];
  let text = "Dimenzije prostorije:\n";
  text += `D = ${formatHrNum(D)} m\n`;
  text += `Š = ${formatHrNum(S)} m\n`;
  text += `V = ${formatHrNum(V)} m\n\n`;

  // POD
  if (chkPod) {
    const podUkupno = podOsnovno + extraPod;
    results.pod = podUkupno;
    text += "Pod:\n";
    text += `Osnovno: D × Š = ${formatHrNum(D)} × ${formatHrNum(S)} = ${formatHrNum(podOsnovno)} m²\n`;
    if (extraPod !== 0) {
      text += `Dodatne dimenzije: ${formatHrNum(extraPod)} m² (računano po formuli ±(d+š))\n`;
    }
    text += `Ukupno pod = ${formatHrNum(podUkupno)} m²\n\n`;
    rowsForCsv.push({ name: "Pod", value: podUkupno, unit: "m2" });
  }

  // ZIDOVI
  if (chkZidovi) {
    const zidoviUkupno = zidoviBruto + extraZid;
    results.zidovi = zidoviUkupno;
    text += "Zidovi:\n";
    text += `Bruto zidovi: 2(D×V) + 2(Š×V) = ${formatHrNum(zidoviBruto)} m²\n`;
    if (extraZid !== 0) {
      text += `Dodatne dimenzije: ${formatHrNum(extraZid)} m² (2d+š)×v\n`;
    }
    text += `Ukupno zidovi = ${formatHrNum(zidoviUkupno)} m²\n\n`;
    rowsForCsv.push({ name: "Zidovi", value: zidoviUkupno, unit: "m2" });
  }

  // HIDRO POD
  if (chkHidroPod) {
    const hidroPod = hidroPodOsnovno + extraHidroPod;
    results.hidroPod = hidroPod;
    text += "Hidroizolacija – pod:\n";
    text += `Osnovno: ${formatHrNum(hidroPodOsnovno)} m²\n`;
    if (extraHidroPod !== 0) {
      text += `Dodatne dimenzije: ${formatHrNum(extraHidroPod)} m²\n`;
    }
    text += `Ukupno hidro pod = ${formatHrNum(hidroPod)} m²\n\n`;
    rowsForCsv.push({ name: "Hidro pod", value: hidroPod, unit: "m2" });
  }

  // HIDRO TRAKA
  if (chkHidroTraka) {
    const traka = trakaOsnovno + extraTraka;
    results.hidroTraka = traka;
    text += "Hidro traka:\n";
    text += `Osnovno: 2D + 2Š + 2V = ${formatHrNum(trakaOsnovno)} m\n`;
    if (extraTraka !== 0) {
      text += `Dodatne dimenzije: ${formatHrNum(extraTraka)} m (2d+š)\n`;
    }
    text += `Ukupno hidro traka = ${formatHrNum(traka)} m\n\n`;
    rowsForCsv.push({ name: "Hidro traka", value: traka, unit: "m" });
  }

  // SILIKON
  if (chkSilikon) {
    const silikon = silikonOsnovno + extraSilikon;
    results.silikon = silikon;
    text += "Silikon:\n";
    text += `Osnovni opseg: 2D + 2Š + 4V = ${formatHrNum(silikonOsnovno)} m\n`;
    if (extraSilikon !== 0) {
      text += `Dodatne dimenzije: ${formatHrNum(extraSilikon)} m\n`;
    }
    text += `Ukupno silikon = ${formatHrNum(silikon)} m\n\n`;
    rowsForCsv.push({ name: "Silikon", value: silikon, unit: "m" });
  }

  // detalji dodatnih dimenzija
  if (dmDetails.length) {
    text += "Dodatne dimenzije (sažetak):\n";
    dmDetails.forEach(r => {
      text += `${r.index}. d=${formatHrNum(r.d)} m, š=${formatHrNum(r.s)} m, v=${formatHrNum(r.v)} m, znak=${r.sign}\n`;
    });
    text += "\n";
  }

  // sažetak
  const summaryParts = [];
  if (results.pod != null) summaryParts.push(`Pod: ${formatHrNum(results.pod)} m²`);
  if (results.zidovi != null) summaryParts.push(`Zidovi: ${formatHrNum(results.zidovi)} m²`);
  if (results.hidroPod != null) summaryParts.push(`Hidro pod: ${formatHrNum(results.hidroPod)} m²`);
  if (results.hidroTraka != null) summaryParts.push(`Traka: ${formatHrNum(results.hidroTraka)} m`);
  if (results.silikon != null) summaryParts.push(`Silikon: ${formatHrNum(results.silikon)} m`);

  const summary = summaryParts.join(" · ");
  if (summary) {
    text += "Sažetak:\n" + summary + "\n";
  }

  // upis u UI
  const out = document.getElementById("calcOutput");
  out.textContent = text;

  // spremimo globalno za PDF / CSV / Firestore
  window.lastCalc = {
    dimensions: { D, S, V },
    extras: dmDetails,
    results,
    text,
    summary,
    rows: rowsForCsv,
    meta: {
      site: document.getElementById("metaSite")
        ? document.getElementById("metaSite").value.trim()
        : "",
      room: document.getElementById("metaRoom")
        ? document.getElementById("metaRoom").value.trim()
        : "",
      situation: document.getElementById("metaSituation")
        ? Number(document.getElementById("metaSituation").value || 1)
        : 1
    }
  };
}
