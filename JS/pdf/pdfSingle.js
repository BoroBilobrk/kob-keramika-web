// JS/pdf/pdfSingle.js
// PDF za TABELA ZA MJERENJE (Measurement Table)

const { jsPDF } = window.jspdf;
import { ensureRoboto } from "./fontRoboto.js";
import { formatNumber, drawTable, addLogo } from "./pdfHelpers.js";

/**
 * Generira PDF "TABELA ZA MJERENJE" - Measurement Table
 * @param {object} data - Podaci iz autoCalc ili troskovnik
 * @returns {jsPDF} - PDF dokument
 */
export async function buildPdfDocument(data) {
  if (!data) return null;

  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait"
  });

  // Učitaj Roboto font za hrvatske znakove
  await ensureRoboto(doc);
  doc.setFont("Roboto", "normal");

  let y = 10;

  // ==================== ZAGLAVLJE ====================
  // Logo "KERAMIKA" - desno gore
  addLogo(doc, 150, y, 40, 20);

  // Podaci o kompaniji - lijevo
  doc.setFontSize(9);
  doc.text("KOB-KERAMIKA", 10, y + 5);
  doc.text("vl. Slobodan Bilobrk", 10, y + 10);
  doc.text("Tina Ujevića 4, 10450 Klinča Sela", 10, y + 15);
  doc.text("OIB: 27080482187", 10, y + 20);
  doc.text("IBAN: HR0823600001102094050", 10, y + 25);
  doc.text("SWIFT: ZABAHR2X", 10, y + 30);

  y += 40;

  // ==================== INVESTOR SEKCIJA ====================
  doc.setFontSize(10);
  const meta = data.meta || {};
  
  // INVESTITOR
  doc.text("INVESTITOR:", 10, y);
  doc.text(meta.investorName || "GIK GRUPA d.o.o., Zagreb, Pile I. 1", 50, y);
  y += 6;
  doc.text("OIB:", 10, y);
  doc.text("91287854085", 50, y);
  y += 10;

  // GRAĐEVINA
  doc.text("GRAĐEVINA:", 10, y);
  doc.text(meta.siteName || "k.č.br. 1263 k.o. Trešnjevka Nova", 50, y);
  y += 10;

  // ==================== OPIS RADOVA ====================
  doc.setFontSize(11);
  doc.setFont("Roboto", "normal");
  doc.text("Opis radova:", 10, y);
  y += 6;
  
  doc.setFontSize(10);
  const opisRadova = meta.roomName || "Keramičarski radovi";
  doc.text(opisRadova, 10, y);
  y += 10;

  // ==================== TABELA ZA MJERENJE ====================
  doc.setFontSize(12);
  doc.setFont("Roboto", "normal");
  doc.text("TABELA ZA MJERENJE", 10, y);
  y += 8;

  // Pripremi podatke za tablicu
  const rows = [];
  
  // Kreiraj redove iz podataka
  if (data.results) {
    const r = data.results;
    const prices = data.prices || {};
    let redBroj = 1;

    // Definiraj stavke koje želimo prikazati
    const items = [
      { key: "pod", label: "Pod", unit: "m²" },
      { key: "zidovi", label: "Zidovi", unit: "m²" },
      { key: "hidroPod", label: "Hidroizolacija pod", unit: "m²" },
      { key: "hidroTus", label: "Hidroizolacija tuš", unit: "m²" },
      { key: "hidroTraka", label: "Hidro traka", unit: "m" },
      { key: "silikon", label: "Silikon", unit: "m" },
      { key: "sokl", label: "Sokl", unit: "m" },
      { key: "lajsne", label: "Lajsne", unit: "m" },
      { key: "gerung", label: "Gerung", unit: "m" },
      { key: "stepenice", label: "Stepenice", unit: "m" }
    ];

    items.forEach(item => {
      const qty = r[item.key];
      if (qty != null && qty > 0) {
        const price = prices[item.key] || 0;
        const total = qty * price;
        
        rows.push([
          String(redBroj++),
          item.label,
          item.unit,
          formatNumber(qty, 2),
          formatNumber(price, 2),
          formatNumber(qty, 2), // Izvršena količina (ista kao ukupna za pojedinačnu prostoriju)
          formatNumber(total, 2)
        ]);
      }
    });
  } else if (data.items) {
    // Podatci iz troškovnika
    data.items.forEach((item, idx) => {
      if (item.qty > 0) {
        rows.push([
          String(idx + 1),
          item.name,
          item.unit || "kom",
          formatNumber(item.qty, 2),
          formatNumber(item.price || 0, 2),
          formatNumber(item.qty, 2),
          formatNumber(item.total || 0, 2)
        ]);
      }
    });
  }

  // Definiraj zaglavlja tablice
  const headers = [
    { text: "R.br.", width: 15, align: "center" },
    { text: "Opis radova", width: 50, align: "left" },
    { text: "Jed.", width: 15, align: "center" },
    { text: "Količina", width: 25, align: "right" },
    { text: "Cijena (EUR)", width: 25, align: "right" },
    { text: "Izvršeno", width: 25, align: "right" },
    { text: "Ukupno (EUR)", width: 30, align: "right" }
  ];

  // Nacrtaj tablicu
  y = drawTable(doc, 10, y, headers, rows, {
    fontSize: 9,
    headerFontSize: 10,
    rowHeight: 6,
    headerHeight: 8
  });

  y += 5;

  // ==================== UKUPNO ====================
  doc.setFontSize(11);
  doc.setFont("Roboto", "normal");
  
  const total = data.total || (data.results ? calculateTotal(data.results, data.prices) : 0);
  doc.text(`UKUPNO: ${formatNumber(total, 2)} EUR`, 140, y, { align: "right" });

  y += 15;

  // ==================== POTPIS ====================
  doc.setFontSize(10);
  doc.text("Izvođač radova: ____________________", 10, y);
  doc.text("Datum: ____________________", 120, y);

  return doc;
}

/**
 * Pomoćna funkcija za izračun ukupne vrijednosti
 */
function calculateTotal(results, prices) {
  let total = 0;
  const items = ["pod", "zidovi", "hidroPod", "hidroTus", "hidroTraka", "silikon", "sokl", "lajsne", "gerung", "stepenice"];
  
  items.forEach(key => {
    const qty = results[key];
    if (qty != null && qty > 0) {
      const price = (prices && prices[key]) || 0;
      total += qty * price;
    }
  });
  
  return total;
}

// Export za kompatibilnost
export { buildPdfDocumentForSite } from "./pdfSite.js";
