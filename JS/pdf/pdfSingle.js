// JS/pdf/pdfSingle.js
import { jsPDF } from "jspdf";
import { formatHr } from "../core/helpers.js";
import robotoFont from "./Roboto-Regular.js";

export async function buildPdfDocumentSingle(data) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  // FONT FIX
  doc.addFileToVFS("Roboto-Regular.ttf", robotoFont);
  doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
  doc.setFont("Roboto");

  let y = 40;

  doc.addImage("/logo.png", "PNG", 40, 20, 60, 60);
  doc.setFontSize(18);
  doc.text("Građevinska knjiga – obračun prostorije", 120, 60);
  doc.setFontSize(12);
  doc.text("Stranica 1", 500, 40);

  y = 120;

  const m = data.meta;
  const r = data.results;

  doc.setFontSize(12);
  doc.text(`Gradilište: ${m.siteName}`, 40, y); y += 16;
  doc.text(`Prostorija: ${m.roomName}`, 40, y); y += 16;
  doc.text(`Situacija: ${m.situationNo}`, 40, y); y += 16;
  doc.text(`Investitor: ${m.investorName}`, 40, y); y += 30;

  doc.setFontSize(14);
  doc.text("Dimenzije prostorije", 40, y); y += 18;
  doc.setFontSize(12);

  doc.text(`Dužina: ${formatHr(data.D)} m`, 40, y); y += 16;
  doc.text(`Širina: ${formatHr(data.S)} m`, 40, y); y += 16;
  doc.text(`Visina: ${formatHr(data.V)} m`, 40, y); y += 20;

  doc.setFontSize(14);
  doc.text("Mjere i formule", 40, y); y += 18;
  doc.setFontSize(12);

  if (r.pod > 0) { doc.text(`Pod: ${formatHr(r.pod)} m²`, 40, y); y += 16; }
  if (r.zidovi > 0) { doc.text(`Zidovi neto: ${formatHr(r.zidovi)} m²`, 40, y); y += 16; }
  if (r.hidroPod > 0) { doc.text(`Hidro pod: ${formatHr(r.hidroPod)} m²`, 40, y); y += 16; }
  if (r.hidroTus > 0) { doc.text(`Hidro tuš: ${formatHr(r.hidroTus)} m²`, 40, y); y += 16; }
  if (r.hidroTraka > 0) { doc.text(`Hidro traka: ${formatHr(r.hidroTraka)} m`, 40, y); y += 16; }
  if (r.silikon > 0) { doc.text(`Silikon: ${formatHr(r.silikon)} m`, 40, y); y += 16; }

  // Lajsne uvjet
  if (m.chkLajsne && r.lajsne > 0) {
    doc.text(`Lajsne ukupno: ${formatHr(r.lajsne)} m`, 40, y); y += 16;
  }

  // Gerung uvjet
  if (m.chkGerung && r.gerung > 0) {
    doc.text(`Gerung ukupno: ${formatHr(r.gerung)} m`, 40, y); y += 16;
  }

  // Otvori
  if (data.openings && data.openings.length > 0) {
    y += 10;
    doc.text("Otovori:", 40, y);
    y += 16;

    data.openings.forEach(op => {
      const t = `- ${op.type}: ${op.w}×${op.h} m, kom ${op.count}, obod=${formatHr(op.perimeter)} m`;
      doc.text(t, 60, y);
      y += 16;
    });
  }

  // STRANICA 2 – SAŽETAK
  doc.addPage();
  doc.text("Stranica 2", 500, 40);

  let Y = 80;

  doc.setFontSize(16);
  doc.text("Sažetak", 40, Y);
  Y += 30;

  doc.setFontSize(12);
  doc.text(`Ukupni iznos: ${formatHr(r.ukupno)} EUR`, 40, Y); Y += 20;

  return doc;
}
