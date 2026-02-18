// JS/pdf/pdfPrivremenaSituacija.js
// PDF 2: PRVA PRIVREMENA SITUACIJA (First Temporary Situation)

const { jsPDF } = window.jspdf;
import { ensureRoboto } from "./fontRoboto.js";
import { formatHr } from "../core/helpers.js";

/**
 * Generate PDF for "PRVA PRIVREMENA SITUACIJA"
 * @param {Object} data - Contains meta, items, totals
 * @returns {jsPDF} - PDF document
 */
export async function generatePrivremenaSituacijaPDF(data) {
  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait"
  });

  await ensureRoboto(doc);
  doc.setFont("Roboto", "normal");

  // ---------------- COMPANY HEADER ----------------
  let y = 15;
  y = drawCompanyHeader(doc, y);

  // ---------------- LOGO CENTERED ----------------
  y = drawCenteredLogo(doc, y);

  // ---------------- TITLE ----------------
  y = drawTitle(doc, data.meta || {}, y);

  // ---------------- REPORT DATA ----------------
  y = drawReportData(doc, data.meta || {}, y);

  // ---------------- CLIENT INFO ----------------
  y = drawClientInfo(doc, data.meta || {}, y);

  // ---------------- CONTRACT INFO ----------------
  y = drawContractInfo(doc, data.meta || {}, y);

  // ---------------- WORKS TABLE ----------------
  y = drawWorksTable(doc, data.items || [], y);

  // ---------------- FINANCIAL SUMMARY ----------------
  y = drawFinancialSummary(doc, data, y);

  // ---------------- SIGNATURES ----------------
  y = drawSignatures(doc, y);

  // ---------------- FINAL DATA ----------------
  drawFinalData(doc, data.meta || {});

  return doc;
}

/**
 * Draw company header
 */
function drawCompanyHeader(doc, startY) {
  let y = startY;
  
  doc.setFontSize(10);
  doc.setFont("Roboto", "bold");
  doc.text("KOB-KERAMIKA", 105, y, { align: "center" });
  y += 5;
  
  doc.setFont("Roboto", "normal");
  doc.setFontSize(9);
  doc.text("vl. Slobodan Bilobrk", 105, y, { align: "center" });
  y += 4;
  doc.text("OIB: 27080482187", 105, y, { align: "center" });
  y += 4;
  doc.text("IBAN: HR0823600001102094050", 105, y, { align: "center" });
  y += 4;
  doc.text("SWIFT: HPBZHR2X", 105, y, { align: "center" });
  y += 8;

  return y;
}

/**
 * Draw centered logo
 */
function drawCenteredLogo(doc, startY) {
  let y = startY;
  
  try {
    const img = document.querySelector("header img.logo");
    if (img) {
      const logoWidth = 30;
      const logoHeight = 30;
      const xCenter = (210 - logoWidth) / 2; // A4 width is 210mm
      doc.addImage(img, "PNG", xCenter, y, logoWidth, logoHeight);
      y += logoHeight + 5;
    }
  } catch (e) {
    console.warn("Logo image not found:", e);
  }

  return y;
}

/**
 * Draw title
 */
function drawTitle(doc, meta, startY) {
  let y = startY;
  
  doc.setFontSize(14);
  doc.setFont("Roboto", "bold");
  
  const situationNo = meta.situationNo || "1";
  const title = `PRVA PRIVREMENA SITUACIJA br. ${situationNo}/PJ/1`;
  doc.text(title, 105, y, { align: "center" });
  y += 10;

  return y;
}

/**
 * Draw report data section
 */
function drawReportData(doc, meta, startY) {
  let y = startY;
  
  doc.setFontSize(10);
  doc.setFont("Roboto", "normal");
  
  // Delivery date
  const deliveryDate = meta.deliveryDate || new Date().toLocaleDateString('hr-HR');
  doc.text(`Datum isporuke: ${deliveryDate}`, 15, y);
  y += 6;

  // Period of execution
  const periodStart = meta.periodStart || "01.12.2025";
  const periodEnd = meta.periodEnd || "31.12.2025";
  doc.text(`Periode izvršenja: ${periodStart} - ${periodEnd}`, 15, y);
  y += 6;

  // Building object
  doc.setFont("Roboto", "bold");
  doc.text("Na građevinskom objektu:", 15, y);
  doc.setFont("Roboto", "normal");
  y += 5;
  
  const buildingObject = meta.siteName || "k.č.br. 1263 k.o. Trešnjevka Nova";
  doc.text(buildingObject, 20, y);
  y += 8;

  return y;
}

/**
 * Draw client info
 */
function drawClientInfo(doc, meta, startY) {
  let y = startY;
  
  doc.setFontSize(10);
  doc.setFont("Roboto", "bold");
  doc.text("NARUČITELJ:", 15, y);
  doc.setFont("Roboto", "normal");
  y += 5;
  
  const clientName = meta.investorName || "GIK GRUPA d.o.o.";
  const clientLocation = meta.investorLocation || "Zagreb";
  const clientAddress = meta.investorAddress || "Pile I. 1";
  const clientOIB = meta.investorOIB || "91287854085";
  
  doc.text(`${clientName}, ${clientLocation}, ${clientAddress}`, 20, y);
  y += 5;
  doc.text(`OIB: ${clientOIB}`, 20, y);
  y += 8;

  return y;
}

/**
 * Draw contract info
 */
function drawContractInfo(doc, meta, startY) {
  let y = startY;
  
  doc.setFontSize(10);
  
  const contractNo = meta.contractNo || "001/2025";
  doc.text(`Broj ugovora: ${contractNo}`, 15, y);
  y += 6;
  
  const contractValue = formatHr(meta.contractValue || 115233.90);
  doc.text(`Vrijednost ugovora: ${contractValue} EUR`, 15, y);
  y += 10;

  return y;
}

/**
 * Draw works table
 */
function drawWorksTable(doc, items, startY) {
  let y = startY;
  
  doc.setFontSize(11);
  doc.setFont("Roboto", "bold");
  doc.text("TABELA SA IZVRŠENIM RADOVIMA", 15, y);
  y += 8;

  // Table header
  doc.setFontSize(9);
  const colX = {
    vrsta: 15,      // Vrsta radova
    cijena: 150     // Izvršena cijena
  };

  const headerY = y;
  
  // Draw header background
  doc.setFillColor(230, 230, 230);
  doc.rect(colX.vrsta, headerY - 5, 180, 10, 'F');
  
  // Draw header borders
  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  doc.rect(colX.vrsta, headerY - 5, 180, 10);

  // Header text
  doc.setFont("Roboto", "bold");
  doc.text("Vrsta radova", colX.vrsta + 2, headerY);
  doc.text("Izvršena cijena (EUR)", colX.cijena + 2, headerY);

  y = headerY + 5;
  doc.setFont("Roboto", "normal");

  // Table rows
  items.forEach((item, index) => {
    // Check if we need a new page
    if (y > 250) {
      doc.addPage();
      y = 20;
      doc.setFont("Roboto", "normal");
      doc.setFontSize(9);
    }

    const rowHeight = 7;
    
    // Draw row borders
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(colX.vrsta, y + rowHeight, colX.vrsta + 180, y + rowHeight);

    // Row data
    const vrsta = item.opis || item.name || "";
    const cijena = formatHr((item.qty || 0) * (item.cijena || item.price || 0));

    // Wrap long text
    const vrstaLines = doc.splitTextToSize(vrsta, 130);
    doc.text(vrstaLines[0] || "", colX.vrsta + 2, y + 5);
    doc.text(cijena, colX.cijena + 2, y + 5);

    y += rowHeight;
  });

  // Draw table borders
  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  doc.rect(colX.vrsta, headerY - 5, 180, y - headerY + 5);

  y += 5;
  return y;
}

/**
 * Draw financial summary
 */
function drawFinancialSummary(doc, data, startY) {
  let y = startY;
  
  doc.setFontSize(11);
  doc.setFont("Roboto", "bold");
  doc.text("SAŽETAK FINANCIJSKIH PODATAKA", 15, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont("Roboto", "normal");

  const meta = data.meta || {};
  const contractNo = meta.contractNo || "001/2025";
  const contractValue = formatHr(meta.contractValue || 115233.90);
  
  // Calculate total executed works
  const items = data.items || [];
  const executedValue = items.reduce((sum, item) => {
    return sum + ((item.qty || 0) * (item.cijena || item.price || 0));
  }, 0);
  const executedValueFormatted = formatHr(executedValue);

  doc.text(`Broj ugovora: ${contractNo}`, 15, y);
  y += 6;
  doc.text(`Vrijednost radova prema ugovoru: ${contractValue} EUR`, 15, y);
  y += 6;
  doc.setFont("Roboto", "bold");
  doc.text(`Vrijednost izvršenih radova: ${executedValueFormatted} EUR`, 15, y);
  y += 10;

  return y;
}

/**
 * Draw signatures section
 */
function drawSignatures(doc, startY) {
  let y = startY;
  
  doc.setFontSize(10);
  doc.setFont("Roboto", "normal");

  // Two columns for signatures
  doc.text("Slobodan Bilobrk", 20, y);
  doc.text("Nadzorni inženjer", 120, y);
  y += 5;
  
  doc.line(20, y, 80, y);  // Left signature line
  doc.line(120, y, 180, y); // Right signature line
  y += 10;

  return y;
}

/**
 * Draw final data at the bottom
 */
function drawFinalData(doc, meta) {
  const y = 280; // Near bottom of page
  
  doc.setFontSize(9);
  doc.setFont("Roboto", "normal");

  const date = meta.finalDate || new Date().toLocaleDateString('hr-HR');
  const location = meta.finalLocation || "Klinča Sela";
  const operator = meta.operator || "Slobodan Bilobrk";

  doc.text(`Datum: ${date}`, 15, y);
  doc.text(`Lokacija: ${location}`, 15, y + 5);
  doc.text(`Operater: ${operator}`, 15, y + 10);
}
