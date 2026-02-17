// JS/pdf/pdfSingle.js
// PDF za JEDNU prostoriju – TABLICA OBLIK

const { jsPDF } = window.jspdf;
import { ensureRoboto } from "./fontRoboto.js";
import { formatHr } from "../core/helpers.js";

// ===============================
// GLAVNI EXPORT – JEDNA PROSTORIJA
// ===============================
export async function buildPdfDocument(data) {
  return buildPdfDocumentSingle(data);
}

// ===============================
// FALLBACK ZA VIŠE PROSTORIJA
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
      doc.addImage(
        imgData,
        "PNG",
        0,
        0,
        doc.internal.pageSize.getWidth(),
        doc.internal.pageSize.getHeight()
      );
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

  const pageW = doc.internal.pageSize.getWidth();
  const margin = 5;
  const contentW = pageW - 2 * margin;

  let y = 8;

  // 1) ZAGLAVLJE – kao na slici
  y = drawHeader(doc, m, margin, contentW, y);

  // 2) SREDNJA TABLICA (jed. mjera, ukupna količina, cijena…)
  y = drawMainMeasureTable(doc, r, margin, contentW, y + 4);

  // 3) MJERENJA PROSTORIJE (tvoje dimenzije D/S/V)
  y = drawMjerenjaTable(doc, data, y + 6, margin, contentW);

  // 4) STAVKE ZA OBRAČUN (10 stavki)
  y = drawAutomatikaTable(doc, r, y + 3, margin, contentW);

  return doc;
}

// =====================================
// ZAGLAVLJE – INVESTITOR, GRAĐEVINA…
// =====================================
function drawHeader(doc, meta, margin, contentW, startY) {
  let y = startY;

  // Logo gore lijevo (ako postoji u DOM-u)
  try {
    const img = document.querySelector("header img.logo");
    if (img) doc.addImage(img, "PNG", margin, y - 6, 18, 12);
  } catch {}

  doc.setFont("Roboto", "bold");
  doc.setFontSize(11);
  doc.text(
    "MJERENJE KERAMIČARSKIH RADOVA",
    margin + contentW / 2,
    y,
    { align: "center" }
  );

  y += 8;
  doc.setFont("Roboto", "bold");
  doc.setFontSize(8);

  // INVESTITOR:
  doc.text("INVESTITOR:", margin, y);
  doc.setFont("Roboto", "normal");
  doc.text(`${meta.investorName || ""}`, margin + 25, y);

  y += 4;
  doc.setFont("Roboto", "bold");
  doc.text("GRAĐEVINA:", margin, y);
  doc.setFont("Roboto", "normal");
  doc.text(`${meta.siteName || ""}`, margin + 25, y);

  y += 4;
  doc.setFont("Roboto", "bold");
  doc.text("OPIS RADOVA:", margin, y);
  doc.setFont("Roboto", "normal");
  doc.text(`${meta.workDescription || ""}`, margin + 25, y);

  y += 4;
  doc.setFont("Roboto", "bold");
  doc.text("SILIKON", margin, y);

  y += 6;

  // Redni broj po troškovniku, jed. mjera, ukupna količina ugovorena
  doc.setFont("Roboto", "bold");
  doc.text("Redni broj po troškovniku:", margin, y);
  doc.setFont("Roboto", "normal");
  doc.text(`${meta.troskovnikBroj || "12."}`, margin + 45, y);

  doc.setFont("Roboto", "bold");
  doc.text("jed. mjera:", margin + 70, y);
  doc.setFont("Roboto", "normal");
  doc.text(`${meta.jedMjera || "m2"}`, margin + 95, y);

  doc.setFont("Roboto", "bold");
  doc.text("ukupna količina ugovorena:", margin + 110, y);

  // drugi red (firma, OIB, k.o., stranica)
  y += 8;
  doc.setFont("Roboto", "normal");
  const companyLine =
    `${meta.companyName || ""} d.o.o., ${meta.companyAddress || ""}, OIB: ${meta.companyOib || ""}`;
  doc.text(companyLine, margin, y);

  y += 4;
  const koLine = `k.č.br. ${meta.cestica || ""} k.o. ${meta.ko || ""} (${meta.location || ""})`;
  doc.text(koLine, margin, y);

  doc.text("stranica :", margin + contentW - 30, y);
  doc.text("1", margin + contentW - 10, y);

  return y + 6;
}

// =====================================
// SREDNJA TABLICA – jed. mjera / količina / cijena / mjesečno / ukupno
// =====================================
function drawMainMeasureTable(doc, results, margin, contentW, startY) {
  let y = startY;
  const rowH = 6;

  const colJedMj = 20;
  const colUkupna = 40;
  const colCijena = 25;
  const colMjesecno = 40;
  const colUkupno = contentW - colJedMj - colUkupna - colCijena - colMjesecno;

  doc.setFontSize(7);
  doc.setFont("Roboto", "bold");

  // Zaglavlje tablice
  doc.rect(margin, y, colJedMj, rowH);
  doc.text("jed. mjera", margin + 2, y + 3);
  doc.rect(margin + colJedMj, y, colUkupna, rowH);
  doc.text("ukupna količina", margin + colJedMj + 2, y + 2);
  doc.text("ugovorena", margin + colJedMj + 2, y + 5);
  doc.rect(margin + colJedMj + colUkupna, y, colCijena, rowH);
  doc.text("jedinična cijena €", margin + colJedMj + colUkupna + 2, y + 3);
  doc.rect(margin + colJedMj + colUkupna + colCijena, y, colMjesecno, rowH);
  doc.text("izvršena količina", margin + colJedMj + colUkupna + colCijena + 2, y + 2);
  doc.text("radova mjesečno", margin + colJedMj + colUkupna + colCijena + 2, y + 5);
  doc.rect(
    margin + colJedMj + colUkupna + colCijena + colMjesecno,
    y,
    colUkupno,
    rowH
  );
  doc.text("ukupno", margin + colJedMj + colUkupna + colCijena + colMjesecno + 2, y + 3);

  // 1 red za SILIKON – možeš tu kasnije uvesti realne vrijednosti
  y += rowH;
  doc.setFont("Roboto", "normal");

  const jedMj = "m2";
  const ukupnaKolicina = results.silikonUkupno || "";
  const jedCijena = results.silikonCijena || "3,00 €";
  const mjesecno = results.silikonMjesecno || "";
  const ukupno = results.silikonUkupnoIznos || "";

  doc.rect(margin, y, colJedMj, rowH);
  doc.text(jedMj, margin + colJedMj / 2, y + 4, { align: "center" });

  doc.rect(margin + colJedMj, y, colUkupna, rowH);
  doc.text(String(ukupnaKolicina), margin + colJedMj + colUkupna / 2, y + 4, { align: "center" });

  doc.rect(margin + colJedMj + colUkupna, y, colCijena, rowH);
  doc.text(String(jedCijena), margin + colJedMj + colUkupna + colCijena / 2, y + 4, { align: "center" });

  doc.rect(margin + colJedMj + colUkupna + colCijena, y, colMjesecno, rowH);
  doc.text(String(mjesecno), margin + colJedMj + colUkupna + colCijena + colMjesecno / 2, y + 4, { align: "center" });

  doc.rect(
    margin + colJedMj + colUkupna + colCijena + colMjesecno,
    y,
    colUkupno,
    rowH
  );
  doc.text(String(ukupno), margin + contentW - colUkupno / 2, y + 4, { align: "center" });

  return y + rowH;
}

// =====================================
// MJERENJA PROSTORIJE (D/S/V)
// =====================================
function drawMjerenjaTable(doc, data, startY, margin, contentW) {
  let y = startY;

  doc.setFontSize(9);
  doc.setFont("Roboto", "bold");
  doc.text("MJERENJA PROSTORIJE", margin, y);
  y += 4;

  const rowH = 5;
  const fmt = x => formatHr(x);

  doc.setFontSize(8);
  doc.setFont("Roboto", "bold");

  const colW = contentW / 7;
  let x = margin;

  const headers = [
    "Dužina 1",
    "Širina 1",
    "Dužina 2",
    "Širina 2",
    "Dužina 3",
    "Širina 3",
    "Visina"
  ];

  headers.forEach(h => {
    doc.rect(x, y, colW, rowH);
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

  values.forEach(v => {
    doc.rect(x, y, colW, rowH);
    doc.text(v, x + colW / 2, y + rowH / 2 + 1, { align: "center" });
    x += colW;
  });

  y += rowH + 3;

  doc.setFont("Roboto", "bold");
  doc.setFontSize(9);
  doc.text("REZULTATI MJERENJA", margin, y);
  y += 4;

  doc.setFont("Roboto", "normal");
  doc.setFontSize(8);

  const results = [
    { label: "Pod", value: fmt(data.results?.pod || 0), unit: "m²" },
    { label: "Zidovi (neto)", value: fmt(data.results?.zidoviNeto || 0), unit: "m²" },
    { label: "Hidro pod", value: fmt(data.results?.hidroPod || 0), unit: "m²" },
    { label: "Hidro tuš", value: fmt(data.results?.hidroTus || 0), unit: "m²" },
    {
      label: "Hidro ukupno",
      value: fmt((data.results?.hidroPod || 0) + (data.results?.hidroTus || 0)),
      unit: "m²"
    }
  ];

  const labelW = contentW * 0.4;
  const valueW = contentW * 0.3;
  const unitW = contentW * 0.3;

  results.forEach(res => {
    doc.rect(margin, y, labelW, rowH);
    doc.text(res.label, margin + 1, y + rowH / 2 + 1);

    doc.rect(margin + labelW, y, valueW, rowH);
    doc.text(
      res.value,
      margin + labelW + valueW / 2,
      y + rowH / 2 + 1,
      { align: "center" }
    );

    doc.rect(margin + labelW + valueW, y, unitW, rowH);
    doc.text(
      res.unit,
      margin + labelW + valueW + unitW / 2,
      y + rowH / 2 + 1,
      { align: "center" }
    );

    y += rowH;
  });

  return y;
}

// =====================================
// STAVKE ZA OBRAČUN – 10 stavki
// =====================================
function drawAutomatikaTable(doc, results, startY, margin, contentW) {
  let y = startY;

  doc.setFontSize(9);
  doc.setFont("Roboto", "bold");
  doc.text("STAVKE ZA OBRAČUN", margin, y);
  y += 4;

  doc.setFont("Roboto", "normal");
  doc.setFontSize(8);

  const rowH = 4;
  const fmt = x => formatHr(x);

  const items = [
    { label: "Pod", value: results.pod, unit: "m²" },
    { label: "Zidovi", value: results.zidoviNeto, unit: "m²" },
    { label: "Hidro pod", value: results.hidroPod, unit: "m²" },
    { label: "Hidro tuš", value: results.hidroTus, unit: "m²" },
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

  items.forEach(item => {
    if (item.value == null) return;

    doc.rect(margin, y, labelW, rowH);
    doc.text(item.label, margin + 1, y + rowH / 2, { baseline: "middle" });

    doc.rect(margin + labelW, y, valueW, rowH);
    doc.text(
      fmt(item.value),
      margin + labelW + valueW / 2,
      y + rowH / 2,
      { align: "center", baseline: "middle" }
    );

    doc.rect(margin + labelW + valueW, y, unitW, rowH);
    doc.text(
      item.unit,
      margin + labelW + valueW + unitW / 2,
      y + rowH / 2,
      { align: "center", baseline: "middle" }
    );

    y += rowH;
  });

  return y;
}
