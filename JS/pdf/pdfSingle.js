// JS/pdf/pdfSingle.js

import { buildPdfDocumentForSite } from "./pdfSite.js";

export async function buildPdfDocumentSingle(data) {
  if (!data) return null;

  // Omotamo prostoriju u array jer site builder očekuje listu
  return await buildPdfDocumentForSite([data]);
}
