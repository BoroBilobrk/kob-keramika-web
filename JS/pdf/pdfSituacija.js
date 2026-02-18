// JS/pdf/pdfSituacija.js
// Generate PDF for situation reports (privremena/okončana)

import { jsPDF } from "jspdf";

export function generateSituacijaPDF(data, type = "privremena") {
  const doc = new jsPDF("p", "mm", "a4");

  // Header
  doc.setFontSize(16);
  doc.text(type === "privremena" ? "PRIVREMENA SITUACIJA" : "OKONČANA SITUACIJA", 105, 20, { align: "center" });

  // Company info
  doc.setFontSize(10);
  doc.text("KOB – KERAMIKA", 10, 35);
  doc.text("vl. Slobodan Bilobrk", 10, 40);
  doc.text("Tina Ujevića 4, 10450 Klinča Sela", 10, 45);
  doc.text("OIB: 27080482187", 10, 50);

  // Site info
  let y = 65;
  if (data.meta) {
    doc.setFontSize(11);
    doc.text(`Gradilište: ${data.meta.siteName || "N/A"}`, 10, y);
    y += 5;
    doc.text(`Investitor: ${data.meta.investorName || "N/A"}`, 10, y);
    y += 5;
    doc.text(`Broj situacije: ${data.meta.situationNo || "N/A"}`, 10, y);
    y += 10;
  }

  // Items table
  doc.setFontSize(10);
  doc.text("R.br.", 10, y);
  doc.text("Opis", 30, y);
  doc.text("Količina", 120, y);
  doc.text("JM", 150, y);
  doc.text("Iznos (€)", 170, y);
  y += 5;

  let rb = 1;
  (data.items || []).forEach(item => {
    if (item.qty > 0) {
      doc.text(String(rb++), 10, y);
      doc.text(item.name || "", 30, y);
      doc.text((item.qty || 0).toFixed(2), 120, y);
      doc.text(item.unit || "m", 150, y);
      doc.text((item.total || 0).toFixed(2), 170, y);
      y += 5;
    }
  });

  // Total
  y += 5;
  doc.setFontSize(12);
  doc.text(`UKUPNO: ${(data.total || 0).toFixed(2)} €`, 120, y);

  return doc;
}
