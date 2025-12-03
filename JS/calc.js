// ===== Helperi brojeva =====
function parseHr(numStr) {
  if (!numStr) return 0;
  if (typeof numStr === "number") return numStr;
  return parseFloat(String(numStr).replace(",", ".").replace(/\s+/g, "")) || 0;
}

function formatHr(num, decimals = 2) {
  if (!isFinite(num)) num = 0;
  return num.toFixed(decimals).replace(".", ",");
}

// ===== Globalno stanje situacije =====
const situationRooms = [];
const situationItems = [];
let lastSituation = null;

// Izračun jedne prostorije na temelju DOM-a
function calcCurrentRoom() {
  const name = document.getElementById("roomName").value.trim() || "Prostorija";
  const itemNo = document.getElementById("roomItemNo").value.trim() || (situationRooms.length + 1).toString();

  const D = parseHr(document.getElementById("dimD").value);
  const S = parseHr(document.getElementById("dimS").value);
  const V = parseHr(document.getElementById("dimV").value);

  const chkPod = document.getElementById("chkPod").checked;
  const chkZidovi = document.getElementById("chkZidovi").checked;
  const chkHidroPod = document.getElementById("chkHidroPod").checked;
  const chkHidroTraka = document.getElementById("chkHidroTraka").checked;
  const chkSilikon = document.getElementById("chkSilikon").checked;
  const chkSokl = document.getElementById("chkSokl").checked;

  let pod = 0, zidovi = 0, hidroPod = 0, hidroTraka = 0, silikon = 0, sokl = 0;

  if (chkPod) pod = D * S;
  if (chkZidovi) zidovi = 2 * D * V + 2 * S * V;
  if (chkHidroPod) hidroPod = D * S;
  if (chkHidroTraka) hidroTraka = 2 * (D + S);
  if (chkSilikon) silikon = 2 * D + 2 * S + 4 * V;
  if (chkSokl) sokl = 2 * (D + S);

  // Dodatne dimenzije
  const extraDimsContainer = document.getElementById("extraDimsContainer");
  extraDimsContainer.querySelectorAll(".extra-row").forEach(row => {
    const d = parseHr(row.querySelector(".exD").value);
    const s = parseHr(row.querySelector(".exS").value);
    const v = parseHr(row.querySelector(".exV").value);
    const sign = row.querySelector(".exSign").value === "-" ? -1 : 1;

    const podDelta = (s + d) * sign;
    const zidDelta = (2 * d + s) * v * sign;
    const hidroTrakaDelta = (2 * d + s) * sign;
    const silikonDelta = ((2 * d + s) + 2 * v) * sign;

    if (chkPod) pod += podDelta;
    if (chkZidovi) zidovi += zidDelta;
    if (chkHidroPod) hidroPod += podDelta;
    if (chkHidroTraka) hidroTraka += hidroTrakaDelta;
    if (chkSilikon) silikon += silikonDelta;
  });

  // Otvori
  const openingsList = document.getElementById("openingsList");
  let doorArea = 0;
  let windowArea = 0;
  let windowPerim = 0;
  let nicheArea = 0;
  let nichePerim = 0;
  let otherPerim = 0;

  openingsList.querySelectorAll(".opening-card").forEach(card => {
    const type = card.getAttribute("data-type");
    const w = parseHr(card.querySelector(".opW").value);
    const h = parseHr(card.querySelector(".opH").value);
    const n = parseHr(card.querySelector(".opN").value) || 1;

    const area = w * h * n;
    const perim = 2 * (w + h) * n;

    if (type === "door") {
      doorArea += area;
    } else if (type === "window") {
      windowArea += area;
      windowPerim += perim;
    } else if (type === "niche") {
      nicheArea += area;
      nichePerim += perim;
    } else {
      otherPerim += perim;
    }
  });

  if (chkZidovi) {
    zidovi -= doorArea;
    zidovi -= windowArea;
    zidovi -= nicheArea;
  }
  if (chkHidroTraka) {
    hidroTraka += windowPerim + nichePerim;
  }
  if (chkSilikon) {
    silikon += windowPerim + nichePerim + otherPerim;
  }

  // Dodatne mjere
  const dmContainer = document.getElementById("dmContainer");
  let dmTotal = 0;
  const dmRows = [];
  dmContainer.querySelectorAll(".dm-row").forEach(row => {
    const name = row.querySelector(".dmName").value.trim() || "Mjera";
    const val = parseHr(row.querySelector(".dmVal").value);
    const sign = row.querySelector(".dmSign").value;
    const signedVal = sign === "-" ? -val : val;
    dmTotal += signedVal;
    dmRows.push({ name, val, sign, signedVal });
  });

  const dmTargets = {
    pod: document.getElementById("dmPod")?.checked,
    zidovi: document.getElementById("dmZidovi")?.checked,
    hidro: document.getElementById("dmHidro")?.checked,
    silikon: document.getElementById("dmSil")?.checked,
    traka: document.getElementById("dmTraka")?.checked,
    sokl: document.getElementById("dmSokl")?.checked,
  };

  if (dmTotal !== 0) {
    if (dmTargets.pod) pod += dmTotal;
    if (dmTargets.zidovi) zidovi += dmTotal;
    if (dmTargets.hidro) hidroPod += dmTotal;
    if (dmTargets.silikon) silikon += dmTotal;
    if (dmTargets.traka) hidroTraka += dmTotal;
    if (dmTargets.sokl) sokl += dmTotal;
  }

  return {
    itemNo,
    name,
    D, S, V,
    pod: pod > 0.0001 ? pod : 0,
    zidovi: zidovi > 0.0001 ? zidovi : 0,
    hidroPod: hidroPod > 0.0001 ? hidroPod : 0,
    hidroTraka: hidroTraka > 0.0001 ? hidroTraka : 0,
    silikon: silikon > 0.0001 ? silikon : 0,
    sokl: sokl > 0.0001 ? sokl : 0,
    doorArea,
    windowArea,
    nicheArea,
    windowPerim,
    nichePerim,
    otherPerim,
    dmTotal,
    dmRows
  };
}

// Tekstualni prikaz rezultata jedne prostorije
function renderRoomResultText(r) {
  let html = "";
  html += `<b>${r.itemNo}. ${r.name}</b><br>`;
  html += `D=${formatHr(r.D)} m, Š=${formatHr(r.S)} m, V=${formatHr(r.V)} m<br>`;

  if (r.pod) html += `Pod: <b>${formatHr(r.pod)}</b> m²<br>`;
  if (r.zidovi) html += `Zidovi: <b>${formatHr(r.zidovi)}</b> m²<br>`;
  if (r.hidroPod) html += `Hidro pod: <b>${formatHr(r.hidroPod)}</b> m²<br>`;
  if (r.hidroTraka) html += `Hidro traka: <b>${formatHr(r.hidroTraka)}</b> m<br>`;
  if (r.silikon) html += `Silikon: <b>${formatHr(r.silikon)}</b> m<br>`;
  if (r.sokl) html += `Sokl: <b>${formatHr(r.sokl)}</b> m<br>`;

  if (r.doorArea || r.windowArea || r.nicheArea) {
    html += `<br><b>Otvori:</b><br>`;
    if (r.doorArea) html += `Vrata: −${formatHr(r.doorArea)} m² (odbijeno sa zidova)<br>`;
    if (r.windowArea) html += `Prozori: −${formatHr(r.windowArea)} m²<br>`;
    if (r.nicheArea) html += `Niše: −${formatHr(r.nicheArea)} m²<br>`;
  }
  if (r.dmRows && r.dmRows.length) {
    html += `<br><b>Dodatne mjere:</b><br>`;
    r.dmRows.forEach((row, i) => {
      html += `${i + 1}. ${row.name}: ${row.sign}${formatHr(row.val)} ⇒ ${formatHr(row.signedVal)}<br>`;
    });
    html += `Ukupno dodatne mjere: <b>${formatHr(r.dmTotal)}</b><br>`;
  }

  return html;
}

// Suma situacije
function calcSituationTotals() {
  const totals = {
    pod: 0,
    zidovi: 0,
    hidroPod: 0,
    hidroTraka: 0,
    silikon: 0,
    sokl: 0
  };
  situationRooms.forEach(r => {
    totals.pod += r.pod;
    totals.zidovi += r.zidovi;
    totals.hidroPod += r.hidroPod;
    totals.hidroTraka += r.hidroTraka;
    totals.silikon += r.silikon;
    totals.sokl += r.sokl;
  });
  return totals;
}

// Tablica svih prostorija
function renderRoomsTable() {
  const wrapper = document.getElementById("roomsTableWrapper");
  const totalDiv = document.getElementById("totalSummary");
  if (!wrapper || !totalDiv) return;

  if (!situationRooms.length) {
    wrapper.innerHTML = "<p style='font-size:12px;opacity:0.8;'>Još nema dodanih prostorija.</p>";
    totalDiv.innerHTML = "";
    return;
  }

  let html = '<div class="table-scroll"><table><thead><tr>';
  html += "<th>R.br</th><th>Prostorija</th><th>Pod m²</th><th>Zidovi m²</th><th>Hidro pod m²</th><th>Hidro traka m</th><th>Silikon m</th><th>Sokl m</th>";
  html += "</tr></thead><tbody>";

  situationRooms.forEach(r => {
    html += "<tr>";
    html += `<td>${r.itemNo}</td>`;
    html += `<td>${r.name}</td>`;
    html += `<td class="num">${r.pod ? formatHr(r.pod) : ""}</td>`;
    html += `<td class="num">${r.zidovi ? formatHr(r.zidovi) : ""}</td>`;
    html += `<td class="num">${r.hidroPod ? formatHr(r.hidroPod) : ""}</td>`;
    html += `<td class="num">${r.hidroTraka ? formatHr(r.hidroTraka) : ""}</td>`;
    html += `<td class="num">${r.silikon ? formatHr(r.silikon) : ""}</td>`;
    html += `<td class="num">${r.sokl ? formatHr(r.sokl) : ""}</td>`;
    html += "</tr>";
  });

  html += "</tbody></table></div>";
  wrapper.innerHTML = html;

  const totals = calcSituationTotals();
  totalDiv.innerHTML = `
    <div class="total-summary">
      Ukupno pod: <b>${formatHr(totals.pod)}</b> m² ·
      zidovi: <b>${formatHr(totals.zidovi)}</b> m² ·
      hidro pod: <b>${formatHr(totals.hidroPod)}</b> m² ·
      hidro traka: <b>${formatHr(totals.hidroTraka)}</b> m ·
      silikon: <b>${formatHr(totals.silikon)}</b> m ·
      sokl: <b>${formatHr(totals.sokl)}</b> m
    </div>
  `;
}

// CSV export – jednostavna verzija
function exportCsv() {
  if (!situationRooms.length) {
    alert("Nema dodanih prostorija u situaciju.");
    return;
  }

  const siteName = document.getElementById("siteName").value.trim();
  const workDesc = document.getElementById("workDesc").value.trim();
  const sitNo = document.getElementById("situationNo").value.trim();
  const unit = document.getElementById("defaultUnit").value.trim() || "m2";
  const price = parseHr(document.getElementById("defaultPrice").value);

  const lines = [];

  lines.push(`"GRAĐEVINA:";"${siteName}";"";"stranica:";""`);
  lines.push(`"OPIS RADOVA:";"${workDesc}"`);
  lines.push("");
  lines.push(`"Redni broj";"Opis";"jed.mj.";"";"ukupna količina ugovorena";"jedinična cijena €";"izv. količina"`);

  situationRooms.forEach(r => {
    const desc = `${r.name} – pod/zidovi/hidro/silikon/sokl`;
    const totalQty = r.pod + r.zidovi + r.hidroPod; // okvirno
    lines.push(`"${r.itemNo}";"${desc}";"${unit}";"";"${formatHr(totalQty)}";"${price ? formatHr(price) : ""}";""`);
  });

  const csvContent = "\ufeff" + lines.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "gradjevinska_knjiga.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// PDF – građevinska knjiga
function buildPdfFromSituation(situation) {
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) {
    alert("PDF modul nije učitan.");
    return null;
  }
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const siteName = situation.meta.siteName || "";
  const workDesc = situation.meta.workDesc || "";
  const sitNo = situation.meta.situationNo || "";
  const unit = situation.meta.unit || "m2";
  const price = situation.meta.price || 0;

  const pageWidth  = doc.internal.pageSize.getWidth();
  const marginLeft = 15;
  const marginTop  = 18;
  const marginRight = 15;
  const contentWidth = pageWidth - marginLeft - marginRight;
  const lineHeight = 5;

  let y = marginTop;
  let pageNo = 1;

  function addHeader() {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("KOB-KERAMIKA", marginLeft, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Građevinska knjiga – situacija " + (sitNo || ""), marginLeft, y + 6);

    const pageLabel = "Stranica " + pageNo;
    const pageLabelWidth = doc.getTextWidth(pageLabel);
    doc.text(pageLabel, pageWidth - marginRight - pageLabelWidth, y);

    y += 14;
    doc.setLineWidth(0.2);
    doc.line(marginLeft, y, pageWidth - marginRight, y);
    y += 6;

    doc.setFontSize(9);
    doc.text("GRAĐEVINA: " + siteName, marginLeft, y);
    y += lineHeight;
    doc.text("OPIS RADOVA: " + (workDesc || "Polaganje keramike"), marginLeft, y);
    y += lineHeight;
    doc.text("Broj predr./sit.: " + (sitNo || "-"), marginLeft, y);
    y += lineHeight;
    doc.line(marginLeft, y, pageWidth - marginRight, y);
    y += 4;

    // header tablice
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);

    const colRb   = 12;
    const colOpis = contentWidth * 0.48;
    const colJm   = 16;
    const colKol  = 24;
    const colJc   = 20;
    const colUk   = contentWidth - (colRb + colOpis + colJm + colKol + colJc);

    const xRb   = marginLeft;
    const xOpis = xRb + colRb;
    const xJm   = xOpis + colOpis;
    const xKol  = xJm + colJm;
    const xJc   = xKol + colKol;
    const xUk   = xJc + colJc;

    doc.text("R.br", xRb + 1,  y);
    doc.text("Opis radova", xOpis + 1, y);
    doc.text("jed.mj.", xJm + 1,  y);
    doc.text("ukupna kol.", xKol + 1,  y);
    doc.text("jed.cijena", xJc + 1,  y);
    doc.text("Iznos", xUk + 1,  y);

    y += 2;
    doc.line(marginLeft, y, pageWidth - marginRight, y);
    y += 4;

    return { colRb, colOpis, colJm, colKol, colJc, colUk, xRb, xOpis, xJm, xKol, xJc, xUk };
  }

  const cols = addHeader();

  function maybeNewPage(rowHeight) {
    const pageHeight = doc.internal.pageSize.getHeight();
    if (y + rowHeight > pageHeight - 20) {
      doc.addPage();
      pageNo++;
      y = marginTop;
      Object.assign(cols, addHeader());
    }
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  let grandTotal = 0;

  situation.items.forEach(item => {
    const descLines = doc.splitTextToSize(item.desc, cols.colOpis - 2);
    const rowHeight = descLines.length * lineHeight + 2;
    maybeNewPage(rowHeight);

    const midY = y + (rowHeight / 2);

    doc.text(String(item.rb), cols.xRb + 1, y + lineHeight);

    let opisY = y + lineHeight;
    descLines.forEach(line => {
      doc.text(line, cols.xOpis + 1, opisY);
      opisY += lineHeight;
    });

    const qtyStr = item.qty != null ? String(formatHr(item.qty)) : "";
    const priceStr = item.price != null ? String(formatHr(item.price)) : "";
    const amount = (item.qty || 0) * (item.price || 0);
    const amountStr = amount ? String(formatHr(amount)) : "";

    grandTotal += amount;

    if (item.unit) doc.text(item.unit, cols.xJm + 1, midY);
    if (qtyStr) doc.text(qtyStr, cols.xKol + 1, midY);
    if (priceStr) doc.text(priceStr, cols.xJc + 1, midY);
    if (amountStr) doc.text(amountStr, cols.xUk + 1, midY);

    y += rowHeight;
    doc.line(marginLeft, y, pageWidth - marginRight, y);
    y += 2;
  });

  // ukupno
  maybeNewPage(10);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  const totalStr = "UKUPNO: " + formatHr(grandTotal) + " €";
  const w = doc.getTextWidth(totalStr);
  doc.text(totalStr, pageWidth - marginRight - w, y + 4);

  return doc;
}

// Export PDF i spremanje lastSituation
function exportPdf() {
  if (!situationRooms.length) {
    alert("Nema dodanih prostorija u situaciju.");
    return;
  }
  const meta = {
    siteName: document.getElementById("siteName").value.trim(),
    workDesc: document.getElementById("workDesc").value.trim(),
    situationNo: document.getElementById("situationNo").value.trim(),
    unit: document.getElementById("defaultUnit").value.trim() || "m2",
    price: parseHr(document.getElementById("defaultPrice").value),
    note: document.getElementById("globalNote").value.trim()
  };
  const totals = calcSituationTotals();

  lastSituation = {
    meta,
    rooms: situationRooms.slice(),
    items: situationItems.slice(),
    totals
  };

  const doc = buildPdfFromSituation(lastSituation);
  if (!doc) return;
  doc.save("gradjevinska_knjiga.pdf");
}

// CSV gumb delegira na exportCsv
function handleExportCsv() {
  exportCsv();
}

// ===== Izvoz za firebase.js / app.js =====
window.calcCurrentRoom = calcCurrentRoom;
window.renderRoomResultText = renderRoomResultText;
window.calcSituationTotals = calcSituationTotals;
window.buildPdfFromSituation = buildPdfFromSituation;
window.exportPdf = exportPdf;
window.exportCsv = exportCsv;
window.situationRooms = situationRooms;
window.situationItems = situationItems;
window.getLastSituation = () => lastSituation;
