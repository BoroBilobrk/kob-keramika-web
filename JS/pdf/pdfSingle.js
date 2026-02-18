// JS/pdf/pdfSingle.js
// PDF generation for single room or site

const { jsPDF } = window.jspdf;
import { ensureRoboto } from "./fontRoboto.js";
import { buildPdfDocumentForSite } from "./pdfSite.js";

export async function buildPdfDocument(data) {
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

  // Header
  doc.setFontSize(16);
  doc.text("KOB-KERAMIKA", 105, 20, { align: "center" });
  doc.setFontSize(11);
  doc.text("Obračun prostorije", 105, 28, { align: "center" });

  let y = 45;

  // Results
  const r = data.results;
  const fmt = (x, dec = 2) =>
    typeof x === "number"
      ? x.toFixed(dec).replace(".", ",")
      : String(x ?? "").replace(".", ",");

  if (r.pod) {
    doc.text(`Pod: ${fmt(r.pod)} m²`, 20, y);
    y += 7;
  }
  if (r.zidovi) {
    doc.text(`Zidovi: ${fmt(r.zidovi)} m²`, 20, y);
    y += 7;
  }
  if (r.hidroPod) {
    doc.text(`Hidro pod: ${fmt(r.hidroPod)} m²`, 20, y);
    y += 7;
  }
  if (r.hidroTus) {
    doc.text(`Hidro tuš: ${fmt(r.hidroTus)} m²`, 20, y);
    y += 7;
  }
  if (r.hidroTraka) {
    doc.text(`Hidro traka: ${fmt(r.hidroTraka)} m`, 20, y);
    y += 7;
  }
  if (r.silikon) {
    doc.text(`Silikon: ${fmt(r.silikon)} m`, 20, y);
    y += 7;
  }
  if (r.sokl) {
    doc.text(`Sokl: ${fmt(r.sokl)} m`, 20, y);
    y += 7;
  }
  if (r.lajsne) {
    doc.text(`Lajsne: ${fmt(r.lajsne)} m`, 20, y);
    y += 7;
  }
  if (r.gerung) {
    doc.text(`Gerung: ${fmt(r.gerung)} m`, 20, y);
    y += 7;
  }
  if (r.stepenice) {
    doc.text(`Stepenice: ${fmt(r.stepenice)} m`, 20, y);
    y += 7;
  }

  return doc;
}

export { buildPdfDocumentForSite };