// JS/pdf/pdfSingle.js
// PDF za POJEDINAČNU PROSTORIJU

const { jsPDF } = window.jspdf;
import { ensureRoboto } from "./fontRoboto.js";
import { formatHr } from "../core/helpers.js";

export async function buildPdfDocument(data) {
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

  const fmt = (x, dec = 2) =>
    typeof x === "number"
      ? x.toFixed(dec).replace(".", ",")
      : String(x ?? "").replace(".", ",");

  // HEADER
  try {
    const img = document.querySelector("header img.logo");
    if (img) {
      doc.addImage(img, "PNG", 10, 6, 18, 18);
    }
  } catch (e) {
    // ako ne uspije – preskoči logo
  }

  let y = 30;

  doc.setFontSize(14);
  doc.text("Građevinska knjiga – obračun prostorije", 12, y);
  y += 10;

  // PODACI O GRADILIŠTU
  const meta = data.meta || {};
  doc.setFontSize(12);
  doc.text("Podaci o gradilištu", 12, y);
  y += 7;

  doc.setFontSize(11);
  doc.text(`Gradilište: ${meta.siteName || "-"}`, 12, y); y += 5;
  doc.text(`Prostorija: ${meta.roomName || "-"}`, 12, y); y += 5;
  doc.text(`Situacija: ${meta.situationNo || "-"}`, 12, y); y += 5;
  doc.text(`Investitor: ${meta.investorName || "-"}`, 12, y); y += 8;

  // DIMENZIJE
  doc.setFontSize(12);
  doc.text("Dimenzije prostorije", 12, y); y += 7;
  doc.setFontSize(11);
  doc.text(`Dužina: ${fmt(data.D)} m`, 12, y); y += 5;
  doc.text(`Širina: ${fmt(data.S)} m`, 12, y); y += 5;
  doc.text(`Visina: ${fmt(data.V)} m`, 12, y); y += 8;

  // REZULTATI
  const r = data.results || {};
  doc.setFontSize(12);
  doc.text("Rezultati obračuna", 12, y); y += 7;
  doc.setFontSize(11);

  if (r.pod != null) {
    doc.text(`Pod: ${fmt(r.pod)} m²`, 12, y); y += 5;
  }
  if (r.zidovi != null) {
    doc.text(`Zidovi: ${fmt(r.zidovi)} m²`, 12, y); y += 5;
  }
  if (r.hidroPod != null) {
    doc.text(`Hidro pod: ${fmt(r.hidroPod)} m²`, 12, y); y += 5;
  }
  if (r.hidroTus != null) {
    doc.text(`Hidro tuš: ${fmt(r.hidroTus)} m²`, 12, y); y += 5;
  }
  if (r.hidroTraka != null) {
    doc.text(`Hidro traka: ${fmt(r.hidroTraka)} m`, 12, y); y += 5;
  }
  if (r.silikon != null) {
    doc.text(`Silikon: ${fmt(r.silikon)} m`, 12, y); y += 5;
  }
  if (r.sokl != null) {
    doc.text(`Sokl: ${fmt(r.sokl)} m`, 12, y); y += 5;
  }
  if (r.lajsne != null) {
    doc.text(`Lajsne: ${fmt(r.lajsne)} m`, 12, y); y += 5;
  }
  if (r.gerung != null) {
    doc.text(`Gerung: ${fmt(r.gerung)} m`, 12, y); y += 5;
  }
  if (r.stepenice != null) {
    doc.text(`Stepenice: ${fmt(r.stepenice)} m`, 12, y); y += 5;
  }

  y += 5;

  // UKUPNO
  if (data.totalPrice != null) {
    doc.setFontSize(12);
    doc.text(`Ukupna cijena: ${fmt(data.totalPrice)} EUR`, 12, y);
  }

  return doc;
}

export async function buildPdfDocumentForSite(roomsData) {
  // Import the existing pdfSite implementation
  const { buildPdfDocumentForSite: pdfSiteFunc } = await import("./pdfSite.js");
  return pdfSiteFunc(roomsData);
}
