// JS/pdf/pdfBase.js
import { jsPDF } from "jspdf";

export function createBasePdf(meta) {
  const doc = new jsPDF("p", "mm", "a4");

  // LOGO
  doc.addImage("logo.png", "PNG", 150, 10, 40, 20);

  // FIRMA
  doc.setFontSize(10);
  doc.text("KOB – KERAMIKA", 10, 15);
  doc.text("vl. Slobodan Bilobrk", 10, 20);
  doc.text("Tina Ujevića 4, 10450 Klinča Sela", 10, 25);
  doc.text("OIB: 27080482187", 10, 30);
  doc.text("IBAN: HR0823600001102094050", 10, 35);

  // GRADILIŠTE
  doc.setFontSize(11);
  doc.text(`GRADILIŠTE: ${meta.siteName}`, 10, 50);

  return doc;
}
