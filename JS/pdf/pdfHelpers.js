// JS/pdf/pdfHelpers.js
// Pomoćne funkcije za PDF generiranje

import { formatHr } from "../core/helpers.js";

/**
 * Formatira broj po hrvatskim standardima
 * @param {number} num - Broj za formatiranje
 * @param {number} decimals - Broj decimala (default: 2)
 * @returns {string} - Formatirani broj (npr. "3,20")
 */
export function formatNumber(num, decimals = 2) {
  return formatHr(num, decimals);
}

/**
 * Crta jednostavnu tablicu u PDF-u
 * @param {jsPDF} doc - jsPDF instanca
 * @param {number} startX - Početna X pozicija
 * @param {number} startY - Početna Y pozicija
 * @param {Array} headers - Zaglavlja stupaca [{text: string, width: number}]
 * @param {Array} rows - Redci podataka (array od array-eva)
 * @param {object} options - Dodatne opcije (fontSize, rowHeight, itd.)
 * @returns {number} - Završna Y pozicija
 */
export function drawTable(doc, startX, startY, headers, rows, options = {}) {
  const {
    fontSize = 9,
    headerFontSize = 10,
    rowHeight = 6,
    headerHeight = 7,
    lineWidth = 0.2,
    align = "left"
  } = options;

  let currentY = startY;

  // Postavi debljinu linije
  doc.setLineWidth(lineWidth);

  // Nacrtaj zaglavlje
  doc.setFontSize(headerFontSize);
  doc.setFont("Roboto", "normal");

  let currentX = startX;
  
  // Nacrtaj header background (opciono)
  doc.setFillColor(240, 240, 240);
  doc.rect(startX, currentY, headers.reduce((sum, h) => sum + h.width, 0), headerHeight, "F");

  // Nacrtaj header tekst
  headers.forEach(header => {
    doc.rect(currentX, currentY, header.width, headerHeight);
    doc.text(header.text, currentX + 1, currentY + 5);
    currentX += header.width;
  });

  currentY += headerHeight;

  // Nacrtaj redove
  doc.setFontSize(fontSize);
  rows.forEach(row => {
    currentX = startX;
    headers.forEach((header, idx) => {
      doc.rect(currentX, currentY, header.width, rowHeight);
      const cellText = row[idx] !== undefined ? String(row[idx]) : "";
      
      if (header.align === "right" || (align === "right" && !header.align)) {
        doc.text(cellText, currentX + header.width - 2, currentY + 4, { align: "right" });
      } else if (header.align === "center") {
        doc.text(cellText, currentX + header.width / 2, currentY + 4, { align: "center" });
      } else {
        doc.text(cellText, currentX + 1, currentY + 4);
      }
      
      currentX += header.width;
    });
    currentY += rowHeight;
  });

  return currentY;
}

/**
 * Dodaje logo u PDF
 * @param {jsPDF} doc - jsPDF instanca
 * @param {number} x - X pozicija
 * @param {number} y - Y pozicija
 * @param {number} width - Širina logoa
 * @param {number} height - Visina logoa
 */
export function addLogo(doc, x, y, width, height) {
  try {
    const img = document.querySelector("header img.logo");
    if (img) {
      doc.addImage(img, "PNG", x, y, width, height);
    }
  } catch (e) {
    console.warn("Nije moguće učitati logo:", e);
  }
}

/**
 * Dodaje zaglavlje s podacima o kompaniji
 * @param {jsPDF} doc - jsPDF instanca
 * @param {number} x - X pozicija
 * @param {number} y - Y pozicija
 * @param {object} options - Opcije (includeLogo, fontSize, itd.)
 * @returns {number} - Završna Y pozicija
 */
export function addCompanyHeader(doc, x, y, options = {}) {
  const {
    includeLogo = true,
    fontSize = 10,
    logoWidth = 40,
    logoHeight = 20
  } = options;

  let currentY = y;

  // Logo
  if (includeLogo) {
    addLogo(doc, 150, currentY, logoWidth, logoHeight);
  }

  // Podaci o kompaniji
  doc.setFontSize(fontSize);
  doc.setFont("Roboto", "normal");

  doc.text("KOB – KERAMIKA", x, currentY);
  currentY += 5;
  doc.text("vl. Slobodan Bilobrk", x, currentY);
  currentY += 5;
  doc.text("Tina Ujevića 4, 10450 Klinča Sela", x, currentY);
  currentY += 5;
  doc.text("OIB: 27080482187", x, currentY);
  currentY += 5;
  doc.text("IBAN: HR0823600001102094050", x, currentY);
  currentY += 5;
  doc.text("SWIFT: ZABAHR2X", x, currentY);
  currentY += 5;

  return currentY;
}

/**
 * Dodaje liniju odvajanja
 * @param {jsPDF} doc - jsPDF instanca
 * @param {number} x1 - Početna X pozicija
 * @param {number} y - Y pozicija
 * @param {number} x2 - Završna X pozicija
 */
export function addSeparatorLine(doc, x1, y, x2) {
  doc.setLineWidth(0.5);
  doc.setDrawColor(0);
  doc.line(x1, y, x2, y);
}

/**
 * Dodaje tekst s automatskim prelamanjem
 * @param {jsPDF} doc - jsPDF instanca
 * @param {string} text - Tekst za prikaz
 * @param {number} x - X pozicija
 * @param {number} y - Y pozicija
 * @param {number} maxWidth - Maksimalna širina
 * @returns {number} - Završna Y pozicija
 */
export function addWrappedText(doc, text, x, y, maxWidth) {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + (lines.length * 5);
}
