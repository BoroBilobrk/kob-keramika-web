// JS/pdf/pdfSituacija.js
// PDF za SITUACIJU (privremena / okončana)

const { jsPDF } = window.jspdf;
import { ensureRoboto } from "./fontRoboto.js";

export async function generateSituacijaPDF(data, type = "privremena") {
  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait"
  });

  // Font za HR znakove
  await ensureRoboto(doc);
  doc.setFont("Roboto", "normal");
  doc.setFontSize(11);
  if (doc.setCharSpace) doc.setCharSpace(0);

  const fmt = (x, dec = 2) =>
    typeof x === "number"
      ? x.toFixed(dec).replace(".", ",")
      : String(x ?? "").replace(".", ",");

  // HEADER
  try {
    const img = document.querySelector("header img.logo");
    if (img) {
      doc.addImage(img, "PNG", 10, 6, 18, 18);
    }
  } catch (e) {
    // ako ne uspije – preskoči logo
  }

  let y = 30;

  // NASLOV
  doc.setFontSize(16);
  const title = type === "privremena" ? "PRIVREMENA SITUACIJA" : "OKONČANA SITUACIJA";
  doc.text(title, 105, y, { align: "center" });
  y += 12;

  // PODACI O GRADILIŠTU
  doc.setFontSize(12);
  doc.text("Podaci o gradilištu", 12, y);
  y += 8;

  doc.setFontSize(11);
  const meta = data.meta || {};
  doc.text(`Šifra gradilišta: ${meta.siteCode || "-"}`, 12, y); y += 6;
  doc.text(`Naziv gradilišta: ${meta.siteName || "-"}`, 12, y); y += 6;
  doc.text(`Prostorija: ${meta.roomName || "-"}`, 12, y); y += 6;
  doc.text(`Broj situacije: ${meta.situationNo || "-"}`, 12, y); y += 6;
  doc.text(`Investitor: ${meta.investorName || "-"}`, 12, y); y += 10;

  // STAVKE IZ TROŠKOVNIKA
  doc.setFontSize(12);
  doc.text("Stavke radova", 12, y);
  y += 8;

  doc.setFontSize(10);
  const items = data.items || [];
  
  items.forEach((item, idx) => {
    if (item.qty > 0) {
      const line = `${idx + 1}. ${item.name}: ${fmt(item.qty)} ${item.unit || ""} × ${fmt(item.price || 0)} EUR = ${fmt(item.total)} EUR`;
      doc.text(line, 14, y);
      y += 6;

      // Provjera za novu stranicu
      if (y > 270) {
        doc.addPage();
        await ensureRoboto(doc);
        doc.setFont("Roboto", "normal");
        doc.setFontSize(10);
        if (doc.setCharSpace) doc.setCharSpace(0);
        y = 20;
      }
    }
  });

  y += 6;

  // UKUPNO
  doc.setFontSize(12);
  doc.text(`Ukupno ova situacija: ${fmt(data.total || 0)} EUR`, 12, y);
  y += 8;

  if (data.prevTotal) {
    doc.text(`Prethodne situacije: ${fmt(data.prevTotal)} EUR`, 12, y);
    y += 6;
  }

  y += 10;

  // POTPISI
  doc.setFontSize(11);
  doc.text("Potpis izvođača: ____________________", 12, y);
  y += 10;
  doc.text("Potpis nadzornog inženjera: ____________________", 12, y);

  return doc;
}
