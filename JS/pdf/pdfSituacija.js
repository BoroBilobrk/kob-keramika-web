// JS/pdf/pdfSituacija.js
// PDF za PRVA PRIVREMENA SITUACIJA (First Temporary Situation)

const { jsPDF } = window.jspdf;
import { ensureRoboto } from "./fontRoboto.js";
import { formatNumber, drawTable, addLogo } from "./pdfHelpers.js";

/**
 * Generira PDF "PRVA PRIVREMENA SITUACIJA"
 * @param {object} data - Podaci o situaciji (meta, items, total)
 * @param {string} type - Tip situacije ("privremena" ili "okončana")
 * @returns {jsPDF} - PDF dokument
 */
export function generateSituacijaPDF(data, type = "privremena") {
  if (!data) return null;

  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait"
  });

  // Učitaj Roboto font za hrvatske znakove (sinkrono - mora se pozvati prije teksta)
  // Napomena: pozivamo async funkciju ali ne čekamo - font će se učitati ako nije već
  ensureRoboto(doc).then(() => {
    doc.setFont("Roboto", "normal");
  }).catch(() => {
    doc.setFont("helvetica", "normal");
  });

  doc.setFont("Roboto", "normal");

  let y = 10;
  const meta = data.meta || {};

  // ==================== ZAGLAVLJE - Podaci o kompaniji ====================
  doc.setFontSize(9);
  doc.text("KOB-KERAMIKA", 10, y);
  y += 5;
  doc.text("vl. Slobodan Bilobrk", 10, y);
  y += 5;
  doc.text("Tina Ujevića 4, 10450 Klinča Sela", 10, y);
  y += 5;
  doc.text("OIB: 27080482187", 10, y);
  y += 5;
  doc.text("IBAN: HR0823600001102094050", 10, y);
  y += 5;
  doc.text("SWIFT: ZABAHR2X", 10, y);

  // ==================== LOGO - Centralno ====================
  // Logo se dodaje desno gore
  addLogo(doc, 160, 10, 35, 18);

  y = 45;

  // ==================== NASLOV ====================
  doc.setFontSize(14);
  doc.setFont("Roboto", "normal");
  const title = type === "okončana" 
    ? `OKONČANA SITUACIJA br. ${meta.situationNo || "1/PJ/1"}`
    : `PRVA PRIVREMENA SITUACIJA br. ${meta.situationNo || "1/PJ/1"}`;
  
  const titleWidth = doc.getTextWidth(title);
  doc.text(title, (210 - titleWidth) / 2, y); // Centrirano
  y += 10;

  // ==================== PODACI O IZVJEŠTAJU ====================
  doc.setFontSize(10);
  doc.setFont("Roboto", "normal");

  // Datum isporuke
  const today = new Date();
  const dateStr = `${today.getDate()}.${today.getMonth() + 1}.${today.getFullYear()}`;
  doc.text(`Datum isporuke: ${dateStr}`, 10, y);
  y += 6;

  // Periode izvršenja
  doc.text("Periode izvršenja: od 1.12.2025 do 31.12.2025", 10, y);
  y += 6;

  // Gradilište
  doc.text("Na građevinskom objektu:", 10, y);
  y += 6;
  doc.text(meta.siteName || "k.č.br. 1263 k.o. Trešnjevka Nova", 15, y);
  y += 10;

  // ==================== NARUČITELJ ====================
  doc.setFontSize(10);
  doc.text("NARUČITELJ:", 10, y);
  y += 6;
  doc.text(meta.investorName || "GIK GRUPA d.o.o., Zagreb, Pile I. 1", 15, y);
  y += 5;
  doc.text("OIB: 91287854085", 15, y);
  y += 10;

  // ==================== BROJ UGOVORA I VRIJEDNOST ====================
  doc.text("Broj ugovora:", 10, y);
  doc.text(meta.contractNo || "(broj ugovora)", 60, y);
  y += 6;

  doc.text("Vrijednost ugovora:", 10, y);
  const contractValue = meta.contractValue || "115.233,90";
  doc.text(`${contractValue} EUR`, 60, y);
  y += 12;

  // ==================== TABELA SA IZVRŠENIM RADOVIMA ====================
  doc.setFontSize(11);
  doc.text("IZVRŠENI RADOVI:", 10, y);
  y += 8;

  const rows = [];
  
  if (data.items && data.items.length > 0) {
    data.items.forEach(item => {
      if (item.qty > 0 || item.total > 0) {
        rows.push([
          item.name || item.label || "Radovi",
          formatNumber(item.total || 0, 2)
        ]);
      }
    });
  } else {
    // Dummy podaci ako nema stavki
    rows.push(["Keramičarski radovi", formatNumber(data.total || 600, 2)]);
  }

  const headers = [
    { text: "Vrsta radova", width: 120, align: "left" },
    { text: "Izvršena cijena (EUR)", width: 65, align: "right" }
  ];

  y = drawTable(doc, 10, y, headers, rows, {
    fontSize: 9,
    headerFontSize: 10,
    rowHeight: 7,
    headerHeight: 8
  });

  y += 10;

  // ==================== SAŽETAK FINANCIJSKIH PODATAKA ====================
  doc.setFontSize(11);
  doc.text("SAŽETAK:", 10, y);
  y += 8;

  doc.setFontSize(10);
  doc.text(`Broj ugovora: ${meta.contractNo || "(broj ugovora)"}`, 10, y);
  y += 6;

  const contractVal = parseFloat(String(meta.contractValue || "115233.90").replace(",", "."));
  doc.text(`Vrijednost radova prema ugovoru: ${formatNumber(contractVal, 2)} EUR`, 10, y);
  y += 6;

  const executedValue = data.total || 600;
  doc.text(`Vrijednost izvršenih radova: ${formatNumber(executedValue, 2)} EUR`, 10, y);
  y += 6;

  const prevTotal = data.prevTotal || 0;
  if (prevTotal > 0) {
    doc.text(`Prethodne situacije (ukupno): ${formatNumber(prevTotal, 2)} EUR`, 10, y);
    y += 6;
  }

  const remaining = contractVal - executedValue - prevTotal;
  doc.text(`Preostala vrijednost: ${formatNumber(remaining, 2)} EUR`, 10, y);
  y += 15;

  // ==================== POTPISI ====================
  doc.setFontSize(10);
  
  // Dva potpisa - lijevo i desno
  doc.text("Izvođač radova:", 10, y);
  doc.text("Nadzorni inženjer:", 120, y);
  y += 8;

  doc.text("____________________", 10, y);
  doc.text("____________________", 120, y);
  y += 5;

  doc.text("Slobodan Bilobrk", 10, y);
  y += 15;

  // ==================== FINALNI PODACI ====================
  doc.setFontSize(9);
  const location = "Klinča Sela";
  const finalDate = `${today.getDate()}.${today.getMonth() + 1}.${today.getFullYear()}`;
  
  doc.text(`Datum: ${finalDate}`, 10, y);
  y += 5;
  doc.text(`Lokacija: ${location}`, 10, y);
  y += 5;
  doc.text(`Operater: ${meta.operator || "KOB-KERAMIKA"}`, 10, y);

  return doc;
}

/**
 * Export async verzija funkcije koja čeka učitavanje fonta
 */
export async function generateSituacijaPDFAsync(data, type = "privremena") {
  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait"
  });

  // Učitaj Roboto font i čekaj
  await ensureRoboto(doc);
  doc.setFont("Roboto", "normal");

  // Kopiraj ostatak koda iz generateSituacijaPDF
  // (pozivamo originalnu funkciju ali s već učitanim fontom)
  const tempDoc = generateSituacijaPDF(data, type);
  
  return tempDoc;
}
