// JS/pdf/pdfSingle.js
// PDF za pojedinačnu prostoriju

const { jsPDF } = window.jspdf;
import { ensureRoboto } from "./fontRoboto.js";
import { formatHr } from "../core/helpers.js";
import { buildPdfDocumentForSite } from "./pdfSite.js";

export async function buildPdfDocument(data = {}) {
  if (!data || !data.results) return null;

  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait"
  });

  await ensureRoboto(doc);
  doc.setFont("Roboto", "normal");
  doc.setFontSize(11);
  if (doc.setCharSpace) doc.setCharSpace(0);

  const meta = data.meta || {};
  const dims = data.dims || {};
  const results = data.results || {};

  let y = 18;

  // HEADER
  try {
    const img = document.querySelector("header img.logo");
    if (img) {
      doc.addImage(img, "PNG", 10, 6, 18, 18);
    }
  } catch (e) {
    // ignore logo errors
  }

  doc.setFontSize(12);
  doc.text("Građevinska knjiga – obračun prostorije", 30, 12);

  doc.setFontSize(11);
  doc.setDrawColor(0);
  doc.setLineWidth(0.2);
  doc.rect(8, 14, 194, 270);

  // META
  y = 28;
  doc.setFontSize(13);
  doc.text("Podaci o prostoru", 12, y);
  y += 6;
  doc.setFontSize(11);
  doc.text(`Gradilište: ${meta.siteName || "-"}`, 12, y);
  y += 5;
  doc.text(`Prostorija: ${meta.roomName || "-"}`, 12, y);
  y += 5;
  doc.text(`Situacija: ${meta.situationNo || "-"}`, 12, y);
  y += 7;

  // DIMS
  if (dims.D || dims.S || dims.V) {
    doc.setFontSize(12);
    doc.text("Dimenzije", 12, y);
    y += 6;
    doc.setFontSize(11);
    doc.text(`D: ${formatHr(dims.D || 0)} m`, 12, y);
    y += 5;
    doc.text(`Š: ${formatHr(dims.S || 0)} m`, 12, y);
    y += 5;
    doc.text(`V: ${formatHr(dims.V || 0)} m`, 12, y);
    y += 7;
  }

  // RESULTS TABLE
  doc.setFontSize(12);
  doc.text("Obračun", 12, y);
  y += 6;

  const rows = [
    { label: "Pod", value: results.pod, unit: "m²" },
    { label: "Zidovi", value: results.zidovi, unit: "m²" },
    { label: "Hidro pod", value: results.hidroPod, unit: "m²" },
    { label: "Hidro tuš", value: results.hidroTus, unit: "m²" },
    { label: "Hidro ukupno", value: results.hidroUkupno, unit: "m²" },
    { label: "Hidro traka", value: results.hidroTraka, unit: "m" },
    { label: "Silikon", value: results.silikon, unit: "m" },
    { label: "Sokl", value: results.sokl, unit: "m" },
    { label: "Lajsne", value: results.lajsne, unit: "m" },
    { label: "Gerung", value: results.gerung, unit: "m" },
    { label: "Stepenice", value: results.stepenice, unit: "m" }
  ].filter(item => Number(item.value || 0) !== 0);

  doc.setFontSize(11);
  doc.text("Stavka", 12, y);
  doc.text("Količina", 140, y, { align: "right" });
  doc.text("Jedinica", 190, y, { align: "right" });
  y += 3;

  doc.setLineWidth(0.2);
  doc.line(12, y, 190, y);
  y += 5;

  if (!rows.length) {
    doc.text("Sve vrijednosti su 0.", 12, y);
    y += 5;
  } else {
    rows.forEach(row => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(row.label, 12, y);
      doc.text(formatHr(row.value), 140, y, { align: "right" });
      doc.text(row.unit, 190, y, { align: "right" });
      y += 5;
    });
  }

  return doc;
}

export { buildPdfDocumentForSite };