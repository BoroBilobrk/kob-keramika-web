// JS/pdf/pdfSingle.js
// PDF za JEDNU prostoriju â€“ TABLICA OBLIK

const { jsPDF } = window.jspdf;
import { ensureRoboto } from "./fontRoboto.js";
import { formatHr } from "../core/helpers.js";

// ===============================
// GLAVNI EXPORT â€“ JEDNA PROSTORIJA
// ===============================
export async function buildPdfDocument(data) {
  return buildPdfDocumentSingle(data);
}

// ===============================
// FALLBACK ZA VIĹ E PROSTORIJA
// ===============================
export async function buildPdfDocumentForSite(rooms) {
  if (!rooms || !rooms.length) return null;
  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait"
  });
  await ensureRoboto(doc);
  
  for (let i = 0; i < rooms.length; i++) {
    const pageDoc = await buildPdfDocumentSingle(rooms[i]);
    const pageCount = pageDoc.getNumberOfPages();
    
    for (let j = 1; j <= pageCount; j++) {
      const imgData = pageDoc.internal.pages[j];
      if (i > 0 || j > 1) doc.addPage();
      doc.addImage(imgData, "PNG", 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight());
    }
  }
  
  return doc;
}

// ===============================
// INTERNI BUILDER
// ===============================
async function buildPdfDocumentSingle(data) {
  if (!data) return null;

  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait"
  });

  await ensureRoboto(doc);
  doc.setFont("Roboto", "normal");
  if (doc.setCharSpace) doc.setCharSpace(0);

  const fmt = x => formatHr(x);
  const m = data.meta || {};
  const r = data.results || {};

  let y = 6;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 5;
  const contentW = pageW - 2 * margin;

  // =====================================
  // 1. ZAGLAVLJE
  // =====================================
  drawHeader(doc, m, pageW);
  y = 18;

  // =====================================
  // 2. MJERENJA TABLICA
  // =====================================
  y = drawMjerenjaTable(doc, data, y, margin, contentW);

  // =====================================
  // 3. AUTOMATIKA TABLICA
  // =====================================
  y = drawAutomatikaTable(doc, r, y, margin, contentW);

  // =====================================
  // 4. NAPOMENE
  // =====================================
  if (y < pageH - 20) {
    drawNapomene(doc, y, margin, contentW);
  }

  return doc;
}

// =====================================
// ZAGLAVLJE â€“ INVESTITOR, GRADILIĹ TE
// =====================================
function drawHeader(doc, meta, pageW) {
  try {
    const img = document.querySelector("header img.logo");
    if (img) doc.addImage(img, "PNG", 5, 2, 15, 15);
  } catch {}

  doc.setFontSize(12);
  doc.setFont("Roboto", "bold");
  doc.text("MJERENJE KERAMIÄŚARSKIH RADOVA", pageW / 2, 8, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("Roboto", "normal");
  
  const col1 = 5;
  const col2 = pageW / 2;
  let y = 15;

  doc.text(`GradiliĹˇte: ${meta.siteName || "-"}`, col1, y);
  doc.text(`Datum: ${new Date().toLocaleDateString("hr-HR")}`, col2, y);
  y += 4;

  doc.text(`Prostorija: ${meta.roomName || "-"}`, col1, y);
  doc.text(`Situacija: ${meta.situationNo || "-"}`, col2, y);
  y += 4;

  doc.text(`Investitor: ${meta.investorName || "-"}`, col1, y);
}

// =====================================
// MJERENJA TABLICA
// =====================================
function drawMjerenjaTable(doc, data, startY, margin, contentW) {
  let y = startY;

  doc.setFontSize(10);
  doc.setFont("Roboto", "bold");
  doc.text("MJERENJA PROSTORIJE", margin, y);
  y += 5;

  const rowH = 5;
  const fmt = x => formatHr(x);

  doc.setFontSize(8);
  doc.setFont("Roboto", "bold");

  const colW = contentW / 7;
  let x = margin;

  const headers = ["DuĹľina 1", "Ĺ irina 1", "DuĹľina 2", "Ĺ irina 2", "DuĹľina 3", "Ĺ irina 3", "Visina"];

  headers.forEach((h) => {
    doc.rect(x, y, colW, rowH);
    doc.setFont("Roboto", "bold");
    doc.setFontSize(7);
    doc.text(h, x + colW / 2, y + rowH / 2 + 1, { align: "center" });
    x += colW;
  });

  y += rowH;

  doc.setFont("Roboto", "normal");
  doc.setFontSize(8);
  x = margin;

  const values = [
    fmt(data.D || 0),
    fmt(data.S || 0),
    fmt(data.D || 0),
    fmt(data.S || 0),
    fmt(data.D || 0),
    fmt(data.S || 0),
    fmt(data.V || 0)
  ];

  values.forEach((v) => {
    doc.rect(x, y, colW, rowH);
    doc.text(v, x + colW / 2, y + rowH / 2 + 1, { align: "center" });
    x += colW;
  });

  y += rowH + 3;

  doc.setFont("Roboto", "bold");
  doc.setFontSize(9);
  doc.text("REZULTATI MJERENJA", margin, y);
  y += 5;

  doc.setFont("Roboto", "normal");
  doc.setFontSize(8);

  const results = [
    { label: "Pod", value: fmt(data.results?.pod || 0), unit: "mÂ˛" },
    { label: "Zidovi (neto)", value: fmt(data.results?.zidoviNeto || 0), unit: "mÂ˛" },
    { label: "Hidro pod", value: fmt(data.results?.hidroPod || 0), unit: "mÂ˛" },
    { label: "Hidro tuĹˇ", value: fmt(data.results?.hidroTus || 0), unit: "mÂ˛" },
    { label: "Hidro ukupno", value: fmt((data.results?.hidroPod || 0) + (data.results?.hidroTus || 0)), unit: "mÂ˛" }
  ];

  results.forEach((res) => {
    const labelW = contentW * 0.4;
    const valueW = contentW * 0.3;
    const unitW = contentW * 0.3;

    doc.rect(margin, y, labelW, rowH);
    doc.text(res.label, margin + 1, y + rowH / 2 + 1);

    doc.rect(margin + labelW, y, valueW, rowH);
    doc.text(res.value, margin + labelW + valueW / 2, y + rowH / 2 + 1, { align: "center" });

    doc.rect(margin + labelW + valueW, y, unitW, rowH);
    doc.text(res.unit, margin + labelW + valueW + unitW / 2, y + rowH / 2 + 1, { align: "center" });

    y += rowH;
  });

  y += 2;
  return y;
}

// =====================================
// AUTOMATIKA TABLICA
// =====================================
function drawAutomatikaTable(doc, results, startY, margin, contentW) {
  let y = startY;

  doc.setFontSize(10);
  doc.setFont("Roboto", "bold");
  doc.text("STAVKE ZA OBRAÄŚUN", margin, y);
  y += 5;

  doc.setFont("Roboto", "normal");
  doc.setFontSize(8);

  const rowH = 4;
  const fmt = x => formatHr(x);

  const items = [
    { label: "Pod", value: results.pod, unit: "mÂ˛" },
    { label: "Zidovi", value: results.zidoviNeto, unit: "mÂ˛" },
    { label: "Hidro pod", value: results.hidroPod, unit: "mÂ˛" },
    { label: "Hidro tuĹˇ", value: results.hidroTus, unit: "mÂ˛" },
    { label: "Hidro traka", value: results.hidroTraka, unit: "m" },
    { label: "Silikon", value: results.silikon, unit: "m" },
    { label: "Sokl", value: results.sokl, unit: "m" },
    { label: "Lajsne", value: results.lajsne, unit: "m" },
    { label: "Gerung", value: results.gerung, unit: "m" },
    { label: "Stepenice", value: results.stepenice, unit: "kom" }
  ];

  const labelW = contentW * 0.5;
  const valueW = contentW * 0.25;
  const unitW = contentW * 0.25;

  items.forEach((item) => {
    if (item.value == null) return;

    doc.rect(margin, y, labelW, rowH);
    doc.text(item.label, margin + 1, y + rowH / 2, { baseline: "middle" });

    doc.rect(margin + labelW, y, valueW, rowH);
    doc.text(fmt(item.value), margin + labelW + valueW / 2, y + rowH / 2, { align: "center", baseline: "middle" });

    doc.rect(margin + labelW + valueW, y, unitW, rowH);
    doc.text(item.unit, margin + labelW + valueW + unitW / 2, y + rowH / 2, { align: "center", baseline: "middle" });

    y += rowH;
  });

  y += 2;
  return y;
}

// =====================================
// NAPOMENE
// =====================================
function drawNapomene(doc, startY, margin, contentW) {
  let y = startY;

  doc.setFontSize(9);
  doc.setFont("Roboto", "bold");
  doc.text("NAPOMENE", margin, y);
  y += 4;

  doc.setFont("Roboto", "normal");
  doc.setFontSize(7);

  const notes = [
    "â€˘ Sve mjere kontrolirati u naravi",
    "â€˘ Ponuditelj se duĹľan drĹľati opÄ‡ih uvjeta troĹˇkovnika i vaĹľeÄ‡ih zakona",
    "â€˘ Skela za visine veÄ‡e od 150 cm ukljuÄŤena u cijenu"
  ];

  notes.forEach((note) => {
    const lines = doc.splitTextToSize(note, contentW);
    lines.forEach((line) => {
      doc.text(line, margin, y);
      y += 2.5;
    });
  });
}
