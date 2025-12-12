// JS/pdf/pdfSingle.js
// PDF za JEDNU prostoriju – isti stil kao pdfSite.js

const { jsPDF } = window.jspdf;
import { ensureRoboto } from "./fontRoboto.js";
import { formatHr } from "../core/helpers.js";

export async function buildPdfDocumentSingle(data) {
  if (!data) return null;

  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait"
  });

  // Font fix
  await ensureRoboto(doc);
  doc.setFont("Roboto", "normal");
  doc.setFontSize(11);
  if (doc.setCharSpace) doc.setCharSpace(0);

  let page = 1;

  // ---------------- HEADER ----------------
  function header() {
    try {
      const img = document.querySelector("header img.logo");
      if (img) doc.addImage(img, "PNG", 10, 6, 18, 18);
    } catch {}

    doc.setFontSize(10);
    doc.text("Građevinska knjiga – obračun prostorije", 30, 12);
    doc.text(`Stranica ${page}`, 200 - 10, 12, { align: "right" });

    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.rect(8, 14, 194, 270);

    doc.setFontSize(11);
  }

  header();

  const m = data.meta || {};
  const r = data.results || {};
  const openings = data.openings || [];

  const fmt = x => formatHr(x);

  let y = 22;

  // ---------------- PODACI O GRADILIŠTU ----------------
  doc.setFontSize(13);
  doc.text("Podaci o gradilištu", 12, y); y += 6;

  doc.setFontSize(11);
  doc.text(`Gradilište: ${m.siteName || "-"}`, 12, y); y += 5;
  doc.text(`Prostorija: ${m.roomName || "-"}`, 12, y); y += 5;
  doc.text(`Situacija: ${m.situationNo || "-"}`, 12, y); y += 5;
  doc.text(`Investitor: ${m.investorName || "-"}`, 12, y); y += 5;

  // Format pločica ispod dimenzija – prema tvojoj uputi
  const tf = m.tileFormat;
  if (tf && tf.label) {
    // ispisat ćemo kasnije – nakon dimenzija
  }

  y += 5;

  // ---------------- DIMENZIJE ----------------
  doc.setFontSize(13);
  doc.text("Dimenzije prostorije", 12, y); y += 6;

  doc.setFontSize(11);
  doc.text(`Dužina: ${fmt(data.D)} m`, 12, y); y += 5;
  doc.text(`Širina: ${fmt(data.S)} m`, 12, y); y += 5;
  doc.text(`Visina: ${fmt(data.V)} m`, 12, y); y += 8;

  // ---- Format pločica ispod dimenzija ----
  doc.text(`Format pločica: ${tf ? tf.label : "-"}`, 12, y);
  y += 10;

  // ---------------- MJERE I FORMULE ----------------
  doc.setFontSize(13);
  doc.text("Mjere i formule", 12, y); y += 6;

  doc.setFontSize(11);

  // POD
  if (m.chkPod && r.pod != null) {
    doc.text(`Pod: ${fmt(r.pod)} m²`, 12, y);
    doc.text(`${fmt(data.D)} × ${fmt(data.S)}`, 85, y);
    y += 5;
  }

  // ZIDOVI NETO
  if (m.chkZidovi && r.zidoviNeto != null) {
    const expr = `2×(${fmt(data.D)} + ${fmt(data.S)})×${fmt(data.V)}`;
    doc.text(`Zidovi neto: ${fmt(r.zidoviNeto)} m²`, 12, y);
    doc.text(expr, 85, y);
    y += 5;
  }

  // HIDRO POD
  if (m.chkHidro && r.hidroPod != null) {
    doc.text(`Hidro pod: ${fmt(r.hidroPod)} m²`, 12, y); y += 5;
  }

  // HIDRO TUŠ
  if (m.chkHidro && r.hidroTus != null) {
    doc.text(`Hidro tuš: ${fmt(r.hidroTus)} m²`, 12, y); y += 5;
  }

  // HIDRO TRAKA
  if (m.chkHidroTraka && r.hidroTraka != null) {
    doc.text(`Hidro traka: ${fmt(r.hidroTraka)} m`, 12, y); y += 5;
  }

  // SILIKON
  if (m.chkSilikon && r.silikon != null) {
    doc.text(`Silikon: ${fmt(r.silikon)} m`, 12, y); y += 5;
  }

  // SOKL
  if (m.chkSokl && r.sokl != null) {
    doc.text(`Sokl: ${fmt(r.sokl)} m`, 12, y); y += 5;
  }

  // LAJSNE
  if (m.chkLajsne && r.lajsne != null) {
    const d = r.lajsneData || {};
    doc.setFontSize(13);
    doc.text("10. Lajsne", 12, y); y += 6;
    doc.setFontSize(11);
    doc.text(`Rubovi elemenata: ${fmt(d.perimLajsne)} m`, 14, y); y += 5;
    doc.text(`Ukupno lajsne: ${fmt(r.lajsne)} m`, 14, y); y += 8;
  }

  // GERUNG
  if (m.chkGerung && r.gerung != null) {
    const d = r.gerungData || {};
    doc.setFontSize(13);
    doc.text("11. Gerung", 12, y); y += 6;
    doc.setFontSize(11);
    doc.text(`Rubovi elemenata: ${fmt(d.perimGerung)} m`, 14, y); y += 5;
    doc.text(`Ukupno gerung: ${fmt(r.gerung)} m`, 14, y); y += 8;
  }

  // ---------------- OTVORI ----------------
  doc.setFontSize(13);
  doc.text("Otvori:", 12, y); y += 6;

  doc.setFontSize(11);

  openings.forEach(o => {
    const pov = o.w * o.h;
    const obod = 2 * (o.w + o.h);
    doc.text(
      `- ${o.label}: ${fmt(o.w)}×${fmt(o.h)} m, kom ${o.count}, površina=${fmt(pov)} m², obod=${fmt(obod)} m`,
      12,
      y
    );
    y += 5;
  });

  // ---------------- SAŽETAK – STRANICA 2 ----------------
  doc.addPage();
  page = 2;
  header();

  let y2 = 30;

  doc.setFontSize(14);
  doc.text("Sažetak prostorije", 12, y2); y2 += 10;

  doc.setFontSize(11);
  doc.text(`Ukupna cijena prostorije: ${fmt(data.totalPrice)} EUR`, 12, y2); y2 += 10;

  doc.text("Potpis izvođača: ____________________", 12, y2);

  return doc;
}
