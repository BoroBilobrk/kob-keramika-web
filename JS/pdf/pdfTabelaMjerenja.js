// JS/pdf/pdfTabelaMjerenja.js
// PDF 1: TABELA ZA MJERENJE (Measurement Table)

const { jsPDF } = window.jspdf;
import { ensureRoboto } from "./fontRoboto.js";
import { formatHr } from "../core/helpers.js";

/**
 * Generate PDF for "TABELA ZA MJERENJE"
 * @param {Object} data - Contains meta, items, prices
 * @returns {jsPDF} - PDF document
 */
export async function generateTabelaMjerenjaPDF(data) {
  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait"
  });

  await ensureRoboto(doc);
  doc.setFont("Roboto", "normal");

  // ---------------- HEADER ----------------
  drawHeader(doc, data.meta || {});

  // ---------------- INVESTOR SECTION ----------------
  let y = 50;
  y = drawInvestorSection(doc, data.meta || {}, y);

  // ---------------- DESCRIPTION OF WORKS ----------------
  y = drawDescriptionSection(doc, data.meta || {}, y);

  // ---------------- MEASUREMENT TABLE ----------------
  y = drawMeasurementTable(doc, data.items || [], y);

  return doc;
}

/**
 * Draw header with logo and company data
 */
function drawHeader(doc, meta) {
  // Logo - "KERAMIKA"
  try {
    const img = document.querySelector("header img.logo");
    if (img) {
      doc.addImage(img, "PNG", 15, 10, 25, 25);
    }
  } catch (e) {
    console.warn("Logo image not found:", e);
  }

  // Company data on the right
  doc.setFontSize(9);
  const xRight = 150;
  let yRight = 12;
  
  doc.text("KOB-KERAMIKA", xRight, yRight);
  yRight += 4;
  doc.text("vl. Slobodan Bilobrk", xRight, yRight);
  yRight += 4;
  doc.text("Tina Ujevića 4, 10450 Klinča Sela", xRight, yRight);
  yRight += 4;
  doc.text("OIB: 27080482187", xRight, yRight);
  yRight += 4;
  doc.text("IBAN: HR0823600001102094050", xRight, yRight);
  yRight += 4;
  doc.text("SWIFT: HPBZHR2X", xRight, yRight);
}

/**
 * Draw investor section
 */
function drawInvestorSection(doc, meta, startY) {
  let y = startY;
  
  doc.setFontSize(10);
  doc.setFont("Roboto", "bold");
  doc.text("INVESTITOR:", 15, y);
  doc.setFont("Roboto", "normal");
  
  const investorName = meta.investorName || "GIK GRUPA d.o.o.";
  const investorLocation = meta.investorLocation || "Zagreb";
  const investorAddress = meta.investorAddress || "Pile I. 1";
  const investorOIB = meta.investorOIB || "91287854085";
  
  doc.text(`${investorName}, ${investorLocation}, ${investorAddress}`, 50, y);
  y += 5;
  doc.text(`OIB: ${investorOIB}`, 50, y);
  y += 8;

  doc.setFont("Roboto", "bold");
  doc.text("GRAĐEVINA:", 15, y);
  doc.setFont("Roboto", "normal");
  
  const siteName = meta.siteName || "k.č.br. 1263 k.o. Trešnjevka Nova (RIHTMANOVA stranica)";
  doc.text(siteName, 50, y);
  y += 8;

  return y;
}

/**
 * Draw description of works section
 */
function drawDescriptionSection(doc, meta, startY) {
  let y = startY;
  
  doc.setFontSize(10);
  doc.setFont("Roboto", "bold");
  doc.text("OPIS RADOVA:", 15, y);
  doc.setFont("Roboto", "normal");
  
  const description = meta.workDescription || meta.roomName || "kosi profil";
  doc.text(description, 50, y);
  y += 10;

  return y;
}

/**
 * Draw measurement table
 */
function drawMeasurementTable(doc, items, startY) {
  let y = startY;
  
  doc.setFontSize(11);
  doc.setFont("Roboto", "bold");
  doc.text("TABELA ZA MJERENJE", 15, y);
  y += 8;

  // Table header
  doc.setFontSize(8);
  const colX = {
    rb: 15,        // Red broj
    opis: 30,      // Opis stavke
    jm: 90,        // Jed. mjera
    ukupna: 105,   // Ukupna količina
    cijena: 130,   // Cijena jedinice
    izvrsena: 155, // Izvršena količina
    mjesecni: 180  // Mjesečni obračun
  };

  const headerY = y;
  
  // Draw header background
  doc.setFillColor(230, 230, 230);
  doc.rect(colX.rb, headerY - 5, 185, 15, 'F');
  
  // Draw header borders
  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  doc.rect(colX.rb, headerY - 5, 185, 15);

  // Header text
  doc.setFont("Roboto", "bold");
  doc.text("Red broj", colX.rb + 2, headerY);
  doc.text("Opis stavke", colX.opis + 2, headerY);
  doc.text("Jed.", colX.jm + 2, headerY);
  doc.text("mjera", colX.jm + 2, headerY + 4);
  doc.text("Ukupna", colX.ukupna + 2, headerY);
  doc.text("količina", colX.ukupna + 2, headerY + 4);
  doc.text("Cijena", colX.cijena + 2, headerY);
  doc.text("(EUR)", colX.cijena + 2, headerY + 4);
  doc.text("Izvršena", colX.izvrsena + 2, headerY);
  doc.text("količina", colX.izvrsena + 2, headerY + 4);
  doc.text("Mjesečni", colX.mjesecni + 2, headerY);
  doc.text("obračun", colX.mjesecni + 2, headerY + 4);

  y = headerY + 10;
  doc.setFont("Roboto", "normal");
  doc.setFontSize(9);

  // Table rows
  items.forEach((item, index) => {
    // Check if we need a new page
    if (y > 270) {
      doc.addPage();
      y = 20;
      doc.setFont("Roboto", "normal");
      doc.setFontSize(9);
    }

    const rowHeight = 8;
    
    // Draw row borders
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(colX.rb, y + rowHeight, colX.rb + 185, y + rowHeight);

    // Row data
    const rb = item.rb || (index + 1).toString();
    const opis = item.opis || item.name || "";
    const jm = item.jm || item.unit || "m²";
    const ukupna = formatHr(item.kolicina || item.totalQuantity || 0);
    const cijena = formatHr(item.cijena || item.price || 0);
    const izvrsena = formatHr(item.qty || item.executedQuantity || 0);
    const mjesecni = formatHr((item.qty || 0) * (item.cijena || item.price || 0));

    doc.text(rb, colX.rb + 2, y + 5);
    
    // Wrap long text for opis
    const opisLines = doc.splitTextToSize(opis, 55);
    doc.text(opisLines[0] || "", colX.opis + 2, y + 5);
    
    doc.text(jm, colX.jm + 2, y + 5);
    doc.text(ukupna, colX.ukupna + 2, y + 5);
    doc.text(cijena, colX.cijena + 2, y + 5);
    doc.text(izvrsena, colX.izvrsena + 2, y + 5);
    doc.text(mjesecni, colX.mjesecni + 2, y + 5);

    y += rowHeight;
  });

  // Draw table borders
  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  doc.rect(colX.rb, headerY - 5, 185, y - headerY + 5);

  return y;
}
