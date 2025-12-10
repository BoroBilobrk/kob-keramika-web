// js/pdf/pdfSite.js
import { formatHr } from "../core/helpers.js";
import { UNIT_PRICES } from "../calculations/cjenik.js";

export function buildPdfDocumentForSite(rooms) {
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) {
    alert("PDF modul nije učitan.");
    return null;
  }
  if (!rooms || !rooms.length) return null;

  const doc = new jsPDF();
  let y = 15;

  function newPage() {
    doc.addPage();
    y = 15;
  }

  function w(text, extra = 0) {
    const lines = doc.splitTextToSize(text, 190);
    lines.forEach(line => {
      if (y > 280) newPage();
      doc.text(line, 10, y);
      y += 5;
    });
    y += extra;
  }

  const first = rooms[0];
  const m = first.meta || {};
  const site = m.siteName || "-";
  const investor = m.investorName || "-";
  const today = new Date();
  const dStr = `${String(today.getDate()).padStart(2,"0")}.${String(today.getMonth()+1).padStart(2,"0")}.${today.getFullYear()}.`;

  doc.setFontSize(14);
  doc.text("Građevinska knjiga – više prostorija", 10, y);
  y += 10;

  doc.setFontSize(11);
  w(`Gradilište: ${site}`);
  w(`Investitor: ${investor}`);
  w(`Datum izrade: ${dStr}`, 4);

  doc.setFontSize(12);
  w("Sažetak prostorija:", 2);

  doc.setFontSize(10);
  doc.text("Prostorija", 10, y);
  doc.text("Situacija", 70, y);
  doc.text("Pod (m²)", 120, y);
  doc.text("Zidovi (m²)", 150, y);
  doc.text("Ukupno", 190, y, { align:"right" });
  y += 6;

  let totalSite = 0;

  rooms.forEach(r => {
    const rs = r.results || {};
    const ps = r.prices || {};
    let subtotal = 0;
    Object.keys(ps).forEach(k => {
      const it = ps[k];
      if (!it) return;
      subtotal += it.qty * (UNIT_PRICES[k] || 0);
    });
    totalSite += subtotal;

    if (y > 270) newPage();
    doc.text(r.meta.roomName || "-", 10, y);
    doc.text(r.meta.situationNo || "-", 70, y);
    doc.text(rs.pod != null ? formatHr(rs.pod) : "-", 120, y);
    doc.text(rs.zidoviNeto != null ? formatHr(rs.zidoviNeto) : "-", 150, y);
    doc.text(formatHr(subtotal,2), 190, y, { align:"right" });
    y += 6;
  });

  y += 6;
  w(`UKUPNO ZA GRADILIŠTE: ${formatHr(totalSite,2)} EUR`, 4);

  rooms.forEach((room, i) => {
    if (y > 230) newPage();
    const rs = room.results || {};
    doc.setFontSize(12);
    w(`Prostorija #${i+1}: ${room.meta.roomName || "-"}`, 2);
    doc.setFontSize(10);
    w(`Situacija: ${room.meta.situationNo || "-"}`);
    w(`Format pločice: ${room.meta.tileFormat ? room.meta.tileFormat.label : "-"}`);
    w(`Dimenzije: ${formatHr(room.D)}×${formatHr(room.S)}×${formatHr(room.V)}`, 2);

    if (rs.pod != null)        w(`Pod: ${formatHr(rs.pod)} m²`);
    if (rs.zidoviNeto != null) w(`Zidovi neto: ${formatHr(rs.zidoviNeto)} m²`);
    if (rs.hidroPod != null)   w(`Hidro pod: ${formatHr(rs.hidroPod)} m²`);
    if (rs.hidroTus != null)   w(`Hidro tuš: ${formatHr(rs.hidroTus)} m²`);
    if (rs.hidroTraka != null) w(`Hidro traka: ${formatHr(rs.hidroTraka)} m`);
    if (rs.silikon != null)    w(`Silikon: ${formatHr(rs.silikon)} m`);
    if (rs.sokl != null)       w(`Sokl: ${formatHr(rs.sokl)} m`);
    if (rs.lajsne != null)     w(`Lajsne: ${formatHr(rs.lajsne)} m`);
  });

  return doc;
             }
