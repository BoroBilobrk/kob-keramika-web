// JS/pdf/pdfSingle.js
// Jedna prostorija koristi isti layout kao više prostorija:
import { buildPdfDocumentForSite } from "./pdfSite.js";

export function buildPdfDocumentSingle(data) {
  if (!data) return null;
  // upakiraj jednu prostoriju u array i koristi zajednički generator
  return buildPdfDocumentForSite([data]);
}
