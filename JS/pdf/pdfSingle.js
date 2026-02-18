// JS/pdf/pdfSingle.js - IDENTIČAN EXCEL LAYOUT-u
const { jsPDF } = window.jspdf;
import { ensureRoboto } from "./fontRoboto.js";
import { formatHr } from "../core/helpers.js";

export async function buildPdfDocument(data) {
  return buildPdfDocumentSingle(data);
}

async function buildPdfDocumentSingle(data) {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  await ensureRoboto(doc);
  doc.setFont("Roboto", "normal");

  const pageW = doc.internal.pageSize.getWidth();
  const margin = 10;
  const contentW = pageW - 2 * margin;
  let y = 15;

  // ========== 1. ZAGLAVLJE ==========
  doc.setFont("Roboto", "bold");
  doc.setFontSize(14);
  doc.text("MJERENJE KERAMIČARSKIH RADOVA", margin + contentW/2, y, { align: "center" });
  y += 12;

  // Silikon info
  doc.setFontSize(9);
  doc.setFont("Roboto", "bold");
  doc.text("SILIKON", margin, y);
  y += 3;
  doc.text("Redni broj po troškovniku:", margin, y);
  doc.setFont("Roboto", "normal");
  doc.text("12.", margin + 45, y);
  doc.setFont("Roboto", "bold");
  doc.text("jed. mjera:", margin + 75, y);
  doc.setFont("Roboto", "normal");
  doc.text("m²", margin + 95, y);
  doc.setFont("Roboto", "bold");
  doc.text("ukupna količina ugovorena:", margin + 115, y);
  y += 8;

  // Firma info
  doc.setFont("Roboto", "normal");
  doc.text("GIK GRUPA d.o.o., Zagreb, Pile 1, OIB: 928784085", margin, y);
  y += 4;
  doc.text("k.č.br. 1263 k.o. Tresnjevka Nova (RIHTMANOVA)", margin, y);
  doc.text("stranica: 1", margin + contentW - 25, y);
  y += 12;

  // ========== 2. SREDNJA TABLICA ==========
  const rowH = 7;
  const cols = [25, 40, 30, 45, 45]; // jed.mjera | ukupna | cijena | mjesečno | ukupno
  
  doc.setFontSize(7);
  doc.setFont("Roboto", "bold");
  
  // Header
  let x = margin;
  ["jed. mjera", "ukupna količina
ugovorena", "jedinična cijena €", "izvršena količina
radova mjesečno", "ukupno"].forEach((h, i) => {
    doc.rect(x, y, cols[i], rowH);
    doc.text(h, x + cols[i]/2, y + 4, { align: "center" });
    x += cols[i];
  });

  // Silikon red
  y += rowH;
  x = margin;
  doc.setFont("Roboto", "normal");
  ["m²", "3.00", "3,00 €", "1.50", "4.50"].forEach((v, i) => {
    doc.rect(x, y, cols[i], rowH);
    doc.text(v, x + cols[i]/2, y + 4, { align: "center" });
    x += cols[i];
  });
  y += rowH + 5;

  // ========== 3. MJERENJA PROSTORIJE ==========
  doc.setFontSize(10);
  doc.setFont("Roboto", "bold");
  doc.text("MJERENJA PROSTORIJE", margin, y);
  y += 8;

  // Dimenzije tablica
  const dimCols = [25,25,25,25,25,25,35];
  doc.setFontSize(8);
  doc.setFont("Roboto", "bold");
  x = margin;
  ["Dužina 1", "Širina 1", "Dužina 2", "Širina 2", "Dužina 3", "Širina 3", "Visina"].forEach(h => {
    doc.rect(x, y, dimCols.shift(), 6);
    doc.text(h, x + 12, y + 4, { align: "center" });
    x += 25;
  });
  y += 6;

  // Vrijednosti dimenzija
  doc.setFont("Roboto", "normal");
  const dimValues = [2.40, 1.60, 2.40, 1.60, 2.40, 1.60, 2.45];
  x = margin;
  dimValues.forEach(v => {
    doc.rect(x, y, 25, 6);
    doc.text(formatHr(v), x + 12, y + 4, { align: "center" });
    x += 25;
  });
  y += 12;

  // ========== 4. REZULTATI MJERENJA ==========
  doc.setFont("Roboto", "bold");
  doc.text("REZULTATI MJERENJA", margin, y);
  y += 8;

  const resultsData = [
    { label: "Pod", value: 3.84, unit: "m²" },
    { label: "Zidovi (neto)", value: 25.30, unit: "m²" },
    { label: "Hidro pod", value: 3.84, unit: "m²" },
    { label: "Hidro tuš", value: 2.31, unit: "m²" }
  ];

  doc.setFontSize(8);
  resultsData.forEach(r => {
    doc.rect(margin, y, 60, 6);
    doc.text(r.label, margin + 2, y + 4);
    doc.rect(margin + 60, y, 30, 6);
    doc.text(formatHr(r.value), margin + 75, y + 4, { align: "center" });
    doc.rect(margin + 90, y, 25, 6);
    doc.text(r.unit, margin + 102, y + 4, { align: "center" });
    y += 6;
  });
  y += 8;

  // ========== 5. STAVKE ZA OBRAČUN ==========
  doc.setFontSize(10);
  doc.setFont("Roboto", "bold");
  doc.text("STAVKE ZA OBRAČUN", margin, y);
  y += 8;

  const stavke = [
    { label: "Pod", value: 3.84, unit: "m²" },
    { label: "Zidovi", value: 25.30, unit: "m²" },
    { label: "Hidro pod", value: 3.84, unit: "m²" },
    { label: "Hidro tuš", value: 2.31, unit: "m²" },
    { label: "Hidro traka", value: 17.80, unit: "m" },
    { label: "Silikon", value: 9.80, unit: "m" },
    { label: "Sokl", value: 10.50, unit: "m" },
    { label: "Lajsne", value: 6.00, unit: "m" },
    { label: "Gerung", value: 4.20, unit: "m" },
    { label: "Stepenice", value: 2, unit: "kom" }
  ];

  doc.setFontSize(8);
  doc.setFont("Roboto", "normal");
  stavke.forEach(s => {
    doc.rect(margin, y, 80, 5);
    doc.text(s.label, margin + 2, y + 3.5);
    doc.rect(margin + 80, y, 35, 5);
    doc.text(formatHr(s.value), margin + 97, y + 3.5, { align: "center" });
    doc.rect(margin + 115, y, 25, 5);
    doc.text(s.unit, margin + 127, y + 3.5, { align: "center" });
    y += 5;
  });

  return doc;
}
