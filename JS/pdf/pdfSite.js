// JS/pdf/pdfSite.js
// Glavni generator PDF-a za više prostorija
// A4 vertikalno, građevinski stil, formule kao čisti izrazi

import { jsPDF } from "jspdf";
import { ensureRoboto } from "./fontRoboto.js";

export async function buildPdfDocumentForSite(roomsData = []) {
  if (!roomsData || roomsData.length === 0) return null;

  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait"
  });

  await ensureRoboto(doc);

  let page = 1;

  function header() {
    doc.setFontSize(10);
    doc.text("Građevinska knjiga – obračun prostorije", 10, 10);
    doc.text(`Stranica ${page}`, 200 - 10, 10, { align: "right" });
  }

  // ⚠️ Ispravljeno — mora biti async zbog await ensureRoboto()
  async function newPage() {
    doc.addPage();
    page += 1;
    await ensureRoboto(doc);
    header();
  }

  header();

  // Format broja s decimalom u hrvatskom prikazu
  const fmt = x =>
    typeof x === "number"
      ? x.toFixed(2).replace(".", ",")
      : String(x).replace(".", ",");

  // -------------------------------------------------------
  // GENERIRANJE STRANICA ZA SVAKU PROSTORIJU
  // -------------------------------------------------------

  for (let i = 0; i < roomsData.length; i++) {
    const room = roomsData[i];
    if (i > 0) await newPage();

    const m = room.meta || {};
    const r = room.results || {};
    const openings = room.openings || [];

    let y = 20;

    // Građevinski okvir
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.rect(8, 14, 194, 270);

    // ------------------------------
    // PODACI O GRADILIŠTU
    // ------------------------------
    doc.setFontSize(13);
    doc.text("Podaci o gradilištu", 12, y);
    y += 6;

    doc.setFontSize(11);
    doc.text(`Gradilište: ${m.siteName || "-"}`, 12, y); y += 5;
    doc.text(`Prostorija: ${m.roomName || "-"}`, 12, y); y += 5;
    doc.text(`Situacija: ${m.situationNo || "-"}`, 12, y); y += 5;
    doc.text(`Investitor: ${m.investorName || "-"}`, 12, y); y += 8;

    // ------------------------------
    // DIMENZIJE
    // ------------------------------
    doc.setFontSize(13);
    doc.text("Dimenzije prostorije", 12, y);
    y += 6;

    doc.setFontSize(11);
    doc.text(`Dužina: ${fmt(room.D)} m`, 12, y); y += 5;
    doc.text(`Širina: ${fmt(room.S)} m`, 12, y); y += 5;
    doc.text(`Visina: ${fmt(room.V)} m`, 12, y); y += 8;

    // ------------------------------
    // MJERE I FORMULE
    // ------------------------------
    doc.setFontSize(13);
    doc.text("Mjere i formule", 12, y);
    y += 6;

    doc.setFontSize(11);

    // POD
    if (r.pod != null) {
      doc.text(`Pod: ${fmt(r.pod)} m²`, 12, y);
      doc.text(`${fmt(room.D)} × ${fmt(room.S)}`, 80, y);
      y += 5;
    }

    // ZIDOVI NETO
    if (r.zidoviNeto != null) {
      const sub = openings.filter(o => o.subtract).map(o => fmt(o.w * o.h));
      const subTxt = sub.length ? " − " + sub.join(" − ") : "";

      const expr = `2×(${fmt(room.D)} + ${fmt(room.S)})×${fmt(room.V)}${subTxt}`;

      doc.text(`Zidovi neto: ${fmt(r.zidoviNeto)} m²`, 12, y);
      doc.text(expr, 80, y);
      y += 5;
    }

    // HIDRO POD
    if (r.hidroPod != null) {
      doc.text(`Hidro pod: ${fmt(r.hidroPod)} m²`, 12, y); y += 5;
    }

    // HIDRO TUŠ
    if (r.hidroTus != null) {
      doc.text(`Hidro tuš: ${fmt(r.hidroTus)} m²`, 12, y); y += 5;
    }

    // HIDRO TRAKA
    if (r.hidroTraka != null) {
      doc.text(`Hidro traka: ${fmt(r.hidroTraka)} m`, 12, y); y += 5;
    }

    // SILIKON
    if (r.silikon != null) {
      doc.text(`Silikon: ${fmt(r.silikon)} m`, 12, y); y += 5;
    }

    // LAJSNE / GERUNG
    if (r.lajsne != null) {
      doc.text(`Lajsne / gerung: ${fmt(r.lajsne)} m`, 12, y); y += 8;
    }

    // ------------------------------
    // OTVORI
    // ------------------------------
    doc.setFontSize(13);
    doc.text("Otvori:", 12, y);
    y += 6;

    doc.setFontSize(11);

    openings.forEach(o => {
      const Surf = fmt(o.w * o.h);
      const Obod = fmt(2 * (o.w + o.h));

      doc.text(
        `- ${o.label}: ${fmt(o.w)}×${fmt(o.h)} m, kom ${o.count}, površina=${Surf} m², obod=${Obod} m`,
        12,
        y
      );

      y += 5;
    });
  }

  // -------------------------------------------------------
  // ZADNJA STRANICA — SAŽETAK GRADILIŠTA
  // -------------------------------------------------------

  await newPage();

  let y2 = 20;

  doc.setFontSize(14);
  doc.text("Sažetak gradilišta", 12, y2);
  y2 += 8;

  const site = roomsData[0].meta || {};

  doc.setFontSize(11);
  doc.text(`Gradilište: ${site.siteName || "-"}`, 12, y2); y2 += 5;
  doc.text(`Investitor: ${site.investorName || "-"}`, 12, y2); y2 += 8;

  // Jedinične cijene
  doc.setFontSize(13);
  doc.text("Jedinične cijene", 12, y2);
  y2 += 6;

  const prices = roomsData[0].pricesList || {};

  doc.setFontSize(11);
  Object.keys(prices).forEach(key => {
    const p = prices[key];
    doc.text(`${key}: ${p.price} EUR/${p.unit}`, 12, y2);
    y2 += 5;
  });

  y2 += 5;

  doc.setFontSize(13);
  doc.text("Ukupni iznosi", 12, y2);
  y2 += 6;

  let total = 0;
  roomsData.forEach(r => (total += (r.totalPrice || 0)));

  doc.setFontSize(11);
  doc.text(`Ukupna vrijednost svih prostorija: ${fmt(total)} EUR`, 12, y2);
  y2 += 8;

  doc.text("Ugovorena vrijednost gradilišta: _________ EUR", 12, y2); y2 += 6;
  doc.text("Prethodne situacije (ukupno): _________ EUR", 12, y2); y2 += 6;
  doc.text("Iznos ove situacije: _________ EUR", 12, y2); y2 += 6;
  doc.text("Preostala vrijednost: _________ EUR", 12, y2); y2 += 10;

  doc.setFontSize(12);
  doc.text("Potpis izvođača: ____________________", 12, y2);

  return doc;
        }
