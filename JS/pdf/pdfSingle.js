// JS/pdf/pdfSingle.js
// PDF za JEDNU prostoriju

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
// (za sada koristi prvu)
// ===============================
export async function buildPdfDocumentForSite(rooms) {
  if (!rooms || !rooms.length) return null;
  return buildPdfDocumentSingle(rooms[0]);
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
  doc.setFontSize(11);
  if (doc.setCharSpace) doc.setCharSpace(0);

  let page = 1;

  function header() {
    try {
      const img = document.querySelector("header img.logo");
      if (img) doc.addImage(img, "PNG", 10, 6, 18, 18);
    } catch {}

    doc.setFontSize(10);
    doc.text("Građevinska knjiga – obračun prostorije", 30, 12);
    doc.text(`Stranica ${page}`, 200 - 10, 12, { align: "right" });

    doc.rect(8, 14, 194, 270);
    doc.setFontSize(11);
  }

  header();

  const m = data.meta || {};
  const r = data.results || {};
  const openings = data.openings || [];
  const fmt = x => formatHr(x);

  let y = 22;

  // PODACI
  doc.setFontSize(13);
  doc.text("Podaci o gradilištu", 12, y); y += 6;
  doc.setFontSize(11);
  doc.text(`Gradilište: ${m.siteName || "-"}`, 12, y); y += 5;
  doc.text(`Prostorija: ${m.roomName || "-"}`, 12, y); y += 5;
  doc.text(`Situacija: ${m.situationNo || "-"}`, 12, y); y += 5;
  doc.text(`Investitor: ${m.investorName || "-"}`, 12, y); y += 8;

  // DIMENZIJE
  doc.setFontSize(13);
  doc.text("Dimenzije prostorije", 12, y); y += 6;
  doc.setFontSize(11);
  doc.text(`Dužina: ${fmt(data.D)} m`, 12, y); y += 5;
  doc.text(`Širina: ${fmt(data.S)} m`, 12, y); y += 5;
  doc.text(`Visina: ${fmt(data.V)} m`, 12, y); y += 8;

  if (m.tileFormat?.label) {
    doc.text(`Format pločica: ${m.tileFormat.label}`, 12, y);
    y += 8;
  }

  // MJERE
  doc.setFontSize(13);
  doc.text("Mjere", 12, y); y += 6;
  doc.setFontSize(11);

  if (r.pod != null) doc.text(`Pod: ${fmt(r.pod)} m²`, 12, y), y += 5;
  if (r.zidoviNeto != null) doc.text(`Zidovi: ${fmt(r.zidoviNeto)} m²`, 12, y), y += 5;
  if (r.hidroPod != null) doc.text(`Hidro pod: ${fmt(r.hidroPod)} m²`, 12, y), y += 5;
  if (r.hidroTus != null) doc.text(`Hidro tuš: ${fmt(r.hidroTus)} m²`, 12, y), y += 5;
  if (r.hidroTraka != null) doc.text(`Hidro traka: ${fmt(r.hidroTraka)} m`, 12, y), y += 5;
  if (r.silikon != null) doc.text(`Silikon: ${fmt(r.silikon)} m`, 12, y), y += 5;
  if (r.sokl != null) doc.text(`Sokl: ${fmt(r.sokl)} m`, 12, y), y += 5;
  if (r.lajsne != null) doc.text(`Lajsne: ${fmt(r.lajsne)} m`, 12, y), y += 5;
  if (r.gerung != null) doc.text(`Gerung: ${fmt(r.gerung)} m`, 12, y), y += 5;

  // OTVORI
  if (openings.length) {
    y += 5;
    doc.setFontSize(13);
    doc.text("Otvori", 12, y); y += 6;
    doc.setFontSize(11);

    openings.forEach(o => {
      doc.text(
        `- ${o.label}: ${fmt(o.w)}×${fmt(o.h)} m, kom ${o.count}`,
        12,
        y
      );
      y += 5;
    });
  }

  return doc;
}
