// JS/pdf/pdfSite.js
import { jsPDF } from "jspdf";
import { formatHr } from "../core/helpers.js";
import robotoFont from "./Roboto-Regular.js"; // Base64 font

export async function buildPdfDocumentForSite(rooms) {
  if (!rooms || !rooms.length) return null;

  const doc = new jsPDF({ unit: "pt", format: "a4" });

  // ==== FONT FIX (HR znakovi) ====
  doc.addFileToVFS("Roboto-Regular.ttf", robotoFont);
  doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
  doc.setFont("Roboto");

  let y = 40;
  let page = 1;

  // ===== LOGO + NASLOV =====
  doc.addImage("/logo.png", "PNG", 40, 20, 60, 60);
  doc.setFontSize(18);
  doc.text("Građevinska knjiga – obračun prostorija", 120, 60);
  doc.setFontSize(12);
  doc.text(`Stranica ${page}`, 500, 40);

  y = 120;

  // ==========================
  //     SVAKA PROSTORIJA
  // ==========================
  rooms.forEach((room, idx) => {
    const m = room.meta || {};
    const r = room.results || {};
    const D = room.D, S = room.S, V = room.V;

    // Novi page ako nema mjesta
    if (y > 750) {
      doc.addPage();
      page++;
      y = 60;

      doc.setFontSize(12);
      doc.text(`Stranica ${page}`, 500, 40);
    }

    doc.setFontSize(14);
    doc.text(`${idx + 1}. ${m.roomName || "Prostorija"}`, 40, y);
    y += 20;

    doc.setFontSize(11);
    doc.text(`Dužina: ${formatHr(D)} m`, 40, y); y += 16;
    doc.text(`Širina: ${formatHr(S)} m`, 40, y); y += 16;
    doc.text(`Visina: ${formatHr(V)} m`, 40, y); y += 20;

    // ---- MJERE ----
    doc.setFontSize(12);
    doc.text("Mjere i formule", 40, y);
    y += 18;
    doc.setFontSize(11);

    if (r.pod > 0) { doc.text(`Pod: ${formatHr(r.pod)} m²`, 40, y); y += 16; }
    if (r.zidovi > 0) { doc.text(`Zidovi neto: ${formatHr(r.zidovi)} m²`, 40, y); y += 16; }

    // Hidro pod (UVJET)
    if (r.hidroPod > 0) {
      doc.text(`Hidro pod: ${formatHr(r.hidroPod)} m²`, 40, y);
      y += 16;
    }

    // Hidro tuš (UVJET)
    if (r.hidroTus > 0) {
      doc.text(`Hidro tuš: ${formatHr(r.hidroTus)} m²`, 40, y);
      y += 16;
    }

    // Hidro traka
    if (r.hidroTraka > 0) {
      doc.text(`Hidro traka: ${formatHr(r.hidroTraka)} m`, 40, y);
      y += 16;
    }

    // Silikon
    if (r.silikon > 0) {
      doc.text(`Silikon: ${formatHr(r.silikon)} m`, 40, y);
      y += 16;
    }

    // Lajsne – samo ako su uključene
    if (room.meta.chkLajsne && r.lajsne > 0) {
      doc.text(`Lajsne ukupno: ${formatHr(r.lajsne)} m`, 40, y);
      y += 16;
    }

    // Gerung – samo ako je uključen
    if (room.meta.chkGerung && r.gerung > 0) {
      doc.text(`Gerung ukupno: ${formatHr(r.gerung)} m`, 40, y);
      y += 16;
    }

    // Otvori
    if (room.openings && room.openings.length > 0) {
      y += 10;
      doc.text("Otvori:", 40, y);
      y += 16;

      room.openings.forEach(op => {
        const line = `- ${op.type}, ${op.w}×${op.h} m, kom ${op.count}, obod=${formatHr(op.perimeter)} m`;
        doc.text(line, 60, y);
        y += 16;
      });
    }

    y += 20;
  });

  // ======================================
  //    STRANICA SAŽETKA GRADILIŠTA
  // ======================================
  doc.addPage();
  page++;
  doc.setFontSize(12);
  doc.text(`Stranica ${page}`, 500, 40);

  doc.setFontSize(18);
  doc.text("Sažetak gradilišta", 40, 80);

  const meta0 = rooms[0].meta || {};
  const prices = rooms[0].prices || {};

  let totalValue = rooms.reduce((sum, r) => sum + (r.results.ukupno || 0), 0);

  doc.setFontSize(12);
  let Y = 120;

  doc.text(`Gradilište: ${meta0.siteName || "-"}`, 40, Y); Y += 18;
  doc.text(`Investor: ${meta0.investorName || "-"}`, 40, Y); Y += 30;

  doc.text("Jedinične cijene", 40, Y); Y += 18;

  Object.keys(prices).forEach(k => {
    doc.text(`${k}: ${formatHr(prices[k])} EUR`, 60, Y);
    Y += 16;
  });

  Y += 20;
  doc.text("Ukupni iznosi", 40, Y); Y += 18;

  doc.text(`Ukupna vrijednost svih prostorija: ${formatHr(totalValue)} EUR`, 60, Y);
  Y += 16;

  doc.text(`Ugovorena vrijednost gradilišta: ${formatHr(meta0.contractValue || 0)} EUR`, 60, Y);
  Y += 16;

  doc.text("Prethodne situacije: ______ EUR", 60, Y); Y += 16;
  doc.text(`Iznos ove situacije: ${formatHr(totalValue)} EUR`, 60, Y); Y += 16;

  const remaining = (meta0.contractValue || 0) - totalValue;
  doc.text(`Preostala vrijednost: ${formatHr(remaining)} EUR`, 60, Y); Y += 30;

  doc.text("Potpis izvođača: ____________________", 40, Y);

  return doc;
}
