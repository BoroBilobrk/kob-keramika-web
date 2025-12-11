// JS/pdf/pdfSingle.js
import { buildPdfDocumentForSite } from "./pdfSite.js";

export function buildPdfDocumentSingle(data) {
  if (!data) return null;
  // koristimo isti generator kao za više prostorija, samo s jednim elementom
  return buildPdfDocumentForSite([data]);
}
