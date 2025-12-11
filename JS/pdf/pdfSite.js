// JS/pdf/pdfSite.js
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
  const now = new Date();
  const dStr = `${String(now.getDate()).padStart(2,"0")}.${String(now.getMonth()+1).padStart(2,"0")}.${now.getFullYear()}.`;

  doc.setFontSize(14);
  doc.text("Građevinska knjiga – više prostorija", 10, y);
  y += 10;

  doc.setFontSize(11);
  w(`Gradilište: ${m.siteName || "-"}`);
  w(`Investitor: ${m.investorName || "-"}`);
  w(`Datum izrade: ${dStr}`, 4);

  let totalSite = 0;

  doc.setFontSize(11);
  w("Sažetak prostorija:", 2);
  rooms.forEach((room, i) => {
    const rs = room.results || {};
    const pr = room.prices || {};
    let subtotal = 0;
    Object.keys(pr).forEach(k => {
      const it = pr[k];
      if (!it) return;
      subtotal += it.qty * (UNIT_PRICES[k] || 0);
    });
    totalSite += subtotal;

    w(`#${i+1} ${room.meta.roomName || "-"} (situacija: ${room.meta.situationNo || "-"})`);
    if (rs.pod != null)        w(`  Pod: ${formatHr(rs.pod)} m²`);
    if (rs.zidoviNeto != null) w(`  Zidovi neto: ${formatHr(rs.zidoviNeto)} m²`);
    if (rs.hidroPod != null)   w(`  Hidro pod: ${formatHr(rs.hidroPod)} m²`);
    if (rs.hidroTus != null)   w(`  Hidro tuš: ${formatHr(rs.hidroTus)} m²`);
    w(`  Subtotal: ${formatHr(subtotal,2)} EUR`, 4);
  });

  w(`UKUPNO ZA GRADILIŠTE: ${formatHr(totalSite,2)} EUR`, 4);

  return doc;
}
