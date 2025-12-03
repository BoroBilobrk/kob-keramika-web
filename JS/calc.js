// Helper za parsiranje brojeva s hrvatskim zarezom
function parseHr(numStr) {
  if (!numStr) return 0;
  if (typeof numStr === "number") return numStr;
  return parseFloat(String(numStr).replace(",", ".").replace(/\s+/g, "")) || 0;
}

// Formatiranje na 2 decimale s zarezom
function formatHr(num, decimals = 2) {
  if (!isFinite(num)) num = 0;
  return num.toFixed(decimals).replace(".", ",");
}

// Glavna struktura – sve dodane prostorije u situaciji
const situationRooms = [];

// Izračun jedne prostorije na temelju DOM-a. Vraća objekt.
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

  // Osnovni izračun
  let pod = 0, zidovi = 0, hidroPod = 0, hidroTraka = 0, silikon = 0, sokl = 0;

  if (chkPod) pod = D * S;
  if (chkZidovi) zidovi = 2 * D * V + 2 * S * V;
  if (chkHidroPod) hidroPod = D * S;
  if (chkHidroTraka) hidroTraka = 2 * (D + S);
  if (chkSilikon) silikon = 2 * D + 2 * S + 4 * V;
  if (chkSokl) sokl = 2 * (D + S);

  // Dodatne dimenzije prostorije
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
  let otherPerim = 0; // geberit + vertikale

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

  // Pravila:
  // - vrata: oduzimaju od zidova, ne ulaze u silikon ni hidro traku
  // - prozori + niše: oduzimaju od zidova, ulaze u hidro traku i silikon (perimetar)
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

  // Dodatne mjere (+/-)
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

  // Rezultat za prostoriju
  const roomResult = {
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

  return roomResult;
}

// Generiranje teksta za prikaz rezultata jedne prostorije
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
    if (r.doorArea) html += `Vrata (površina): −${formatHr(r.doorArea)} m² (odbijeno sa zidova)<br>`;
    if (r.windowArea) html += `Prozori (površina): −${formatHr(r.windowArea)} m²<br>`;
    if (r.nicheArea) html += `Niše (površina): −${formatHr(r.nicheArea)} m²<br>`;
    if (r.windowPerim || r.nichePerim || r.otherPerim) {
      html += `Perimetri za hidro traku / silikon: ${formatHr(r.windowPerim + r.nichePerim + r.otherPerim)} m<br>`;
    }
  }

  if (r.dmRows && r.dmRows.length) {
    html += `<br><b>Dodatne mjere (+/−):</b><br>`;
    r.dmRows.forEach((row, idx) => {
      html += `${idx + 1}. ${row.name}: ${row.sign}${formatHr(row.val)} ⇒ ${formatHr(row.signedVal)}<br>`;
    });
    html += `Ukupno dodatne mjere: <b>${formatHr(r.dmTotal)}</b><br>`;
  }

  return html;
}

// Izračun ukupnih količina za situaciju
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

// CSV export u "troškovnik" formatu
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

  // zaglavlje kao u Excel primjeru
  lines.push(`"GRAĐEVINA:";"${siteName}";"";"stranica:";""`);
  lines.push(`"OPIS RADOVA:";"${workDesc}"`);
  lines.push(""); // prazni red
  lines.push(`"Redni broj";"Opis";"jed.mj.";"";"ukupna količina ugovorena";"jedinična cijena €";"Izvršena količina radova"`);

  situationRooms.forEach((r, idx) => {
    const desc = `${r.name} (pod, zidovi, hidro, silikon, sokl)`;
    const totals = r.pod + r.zidovi + r.hidroPod; // samo orijentacijski
    lines.push(`"${r.itemNo}";"${desc}";"${unit}";"";"${formatHr(totals)}";"${formatHr(price)}";""`);
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

// PDF export – jednostavan layout po uzoru na troškovnik
async function exportPdf() {
  if (!situationRooms.length) {
    alert("Nema dodanih prostorija u situaciju.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const siteName = document.getElementById("siteName").value.trim();
  const workDesc = document.getElementById("workDesc").value.trim();
  const sitNo = document.getElementById("situationNo").value.trim();
  const unit = document.getElementById("defaultUnit").value.trim() || "m2";
  const price = parseHr(document.getElementById("defaultPrice").value);

  const pageHeight = doc.internal.pageSize.getHeight();
  const marginLeft = 10;
  const marginTop = 10;
  const lineHeight = 6;

  let y = marginTop;

  function addHeader(pageNo) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("KOB-KERAMIKA", marginLeft, y);
    doc.setFontSize(9);
    doc.text("Građevinska knjiga – situacija " + (sitNo || ""), marginLeft, y + 5);
    doc.text("Stranica " + pageNo, 200 - marginLeft, y + 5, { align: "right" });

    y += 12;
    doc.setFont("helvetica", "normal");
    doc.setLineWidth(0.2);
    doc.line(marginLeft, y, 200 - marginLeft, y);
    y += 4;

    doc.setFontSize(9);
    doc.text("GRAĐEVINA:", marginLeft, y);
    doc.text(siteName || "-", marginLeft + 25, y);
    y += lineHeight;
    doc.text("OPIS RADOVA:", marginLeft, y);
    doc.text(workDesc || "-", marginLeft + 25, y);
    y += lineHeight;
    doc.text("Broj predr./sit.: " + (sitNo || "-"), marginLeft, y);
    y += lineHeight;
    doc.line(marginLeft, y, 200 - marginLeft, y);
    y += 4;

    // zaglavlje tablice
    doc.setFont("helvetica", "bold");
    doc.text("R.br", marginLeft, y);
    doc.text("Opis radova", marginLeft + 15, y);
    doc.text("jed.mj.", 120, y);
    doc.text("ukupna kol.", 140, y);
    doc.text("jed.cijena €", 165, y);
    doc.text("izv.kol.", 190, y, { align: "right" });
    y += 3;
    doc.setLineWidth(0.15);
    doc.line(marginLeft, y, 200 - marginLeft, y);
    y += 4;
    doc.setFont("helvetica", "normal");
  }

  let pageNo = 1;
  addHeader(pageNo);

  situationRooms.forEach((r, idx) => {
    const totals = r.pod + r.zidovi + r.hidroPod;
    const descLines = doc.splitTextToSize(r.name + " – pod/zidovi/hidro/silikon/sokl", 100);

    // provjera prelaska na novu stranicu
    const neededHeight = descLines.length * lineHeight + lineHeight;
    if (y + neededHeight > pageHeight - 20) {
      doc.addPage();
      y = marginTop;
      pageNo++;
      addHeader(pageNo);
    }

    doc.text(String(r.itemNo), marginLeft, y);

    descLines.forEach((line, i) => {
      doc.text(line, marginLeft + 15, y + i * lineHeight);
    });

    doc.text(unit, 120, y);
    doc.text(formatHr(totals), 140, y);
    if (price) doc.text(formatHr(price), 165, y);
    doc.text("", 190, y, { align: "right" });

    y += descLines.length * lineHeight;
    y += 1;
  });

  const note = document.getElementById("globalNote").value.trim();
  if (note) {
    if (y + 10 > pageHeight - 10) {
      doc.addPage();
      y = marginTop;
      pageNo++;
      addHeader(pageNo);
    }
    y += 4;
    doc.setFont("helvetica", "italic");
    doc.text("Napomena: " + note, marginLeft, y);
  }

  doc.save("gradjevinska_knjiga.pdf");
}

