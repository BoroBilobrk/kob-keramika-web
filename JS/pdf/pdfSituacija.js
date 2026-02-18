// JS/pdf/pdfSituacija.js
// Main PDF generator that routes to the appropriate PDF type

import { generateTabelaMjerenjaPDF } from "./pdfTabelaMjerenja.js";
import { generatePrivremenaSituacijaPDF } from "./pdfPrivremenaSituacija.js";

/**
 * Generate PDF based on situation type
 * @param {Object} data - Contains meta, items, totals
 * @param {String} type - Type of PDF: "tabela" or "privremena"
 * @returns {jsPDF} - PDF document
 */
export async function generateSituacijaPDF(data, type = "privremena") {
  if (type === "tabela") {
    return await generateTabelaMjerenjaPDF(data);
  } else {
    return await generatePrivremenaSituacijaPDF(data);
  }
}
