// JS/pdf/pdfSituacija.js
import { createBasePdf } from "./pdfBase.js";

export function generateSituacijaPDF(data, type = "privremena") {
  const doc = createBasePdf(data.meta);

  let y = 65;

  // NASLOV
  doc.setFontSize(14);
  doc.text(
    type === "privremena"
      ? `PRVA PRIVREMENA SITUACIJA br. ${data.meta.situationNo}`
      : `OKONČANA SITUACIJA br. ${data.meta.situationNo}`,
    10,
    y
  );

  y += 10;

  // OPIS RADOVA
  doc.setFontSize(11);
  doc.text("Radovi na izvođenju keramičarskih i hidroizolaterskih radova", 10, y);
  y += 6;
  doc.text(`Prostorija: ${data.meta.roomName}`, 10, y);
  y += 10;

  // TABLICA
  doc.setFontSize(10);
  doc.text("Opis", 10, y);
  doc.text("Količina", 110, y);
  doc.text("Jed.", 150, y);
  doc.text("Iznos €", 170, y);
  y += 4;

  doc.line(10, y, 200, y);
  y += 6;

  data.items.forEach(item => {
    doc.text(item.name, 10, y);
    doc.text(item.qty.toFixed(2), 110, y);
    doc.text(item.unit, 150, y);
    doc.text(item.total.toFixed(2), 170, y);
    y += 6;
  });

  y += 5;
  doc.line(10, y, 200, y);
  y += 8;

  // UKUPNO
  doc.setFontSize(12);
  doc.text("UKUPNO:", 130, y);
  doc.text(`${data.total.toFixed(2)} €`, 170, y);

  return doc;
}
