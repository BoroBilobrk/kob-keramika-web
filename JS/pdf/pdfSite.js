// JS/pdf/pdfSite.js
// Glavni generator PDF-a za više prostorija
// A4 vertikalno, građevinski stil, formule bez teksta, lajsne/gerung odvojeni

const { jsPDF } = window.jspdf;
import { ensureRoboto } from "./fontRoboto.js";

// učitaj logo (logo.png) kao dataURL
async function loadLogoDataUrl() {
  try {
    const resp = await fetch("logo.png");
    if (!resp.ok) return null;
    const blob = await resp.blob();
    return await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn("Ne mogu učitati logo.png za PDF:", e);
    return null;
  }
}

// Format brojeva (decimalna zarez)
const fmt = x =>
  typeof x === "number"
    ? x.toFixed(2).replace(".", ",")
    : String(x).replace(".", ",");

export async function buildPdfDocumentForSite(roomsData = []) {
  if (!roomsData || roomsData.length === 0) return null;

  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait"
  });

  await ensureRoboto(doc);
  doc.setFont("Roboto", "normal");
  doc.setFontSize(11);
  if (doc.setCharSpace) doc.setCharSpace(0);

  const logoDataUrl = await loadLogoDataUrl();

  let page = 1;

  // -------------------------------------------------------
  // HEADER
  // -------------------------------------------------------
  function header() {
    doc.setFont("Roboto", "normal");
    doc.setFontSize(10);
    if (doc.setCharSpace) doc.setCharSpace(0);

    if (logoDataUrl) {
      doc.addImage(logoDataUrl, "PNG", 10, 4, 12, 12);
      doc.text("Građevinska knjiga – obračun prostorije", 26, 10);
    } else {
      doc.text("Građevinska knjiga – obračun prostorije", 10, 10);
    }
    doc.text(`Stranica ${page}`, 190, 10, { align: "right" });

    doc.setFont("Roboto", "normal");
    doc.setFontSize(11);
    if (doc.setCharSpace) doc.setCharSpace(0);
  }

  async function newPage() {
    doc.addPage();
    page++;
    await ensureRoboto(doc);
    doc.setFont("Roboto", "normal");
    doc.setFontSize(11);
    if (doc.setCharSpace) doc.setCharSpace(0);
    header();
  }

  header();

  // -------------------------------------------------------
  // GENERIRANJE STRANICA ZA SVAKU PROSTORIJU
  // -------------------------------------------------------

  for (let i = 0; i < roomsData.length; i++) {
    const room = roomsData[i];
    if (i > 0) await newPage();

    const m = room.meta || {};
    const r = room.results || {};
    const openings = room.openings || [];

    let y = 20;

    // Građevinski okvir
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.rect(8, 14, 194, 270);

    // PODACI O GRADILIŠTU
    doc.setFontSize(13);
    doc.text("Podaci o gradilištu", 12, y);
    y += 6;

    doc.setFontSize(11);
    doc.text(`Gradilište: ${m.siteName || "-"}`, 12, y); y += 5;
    doc.text(`Prostorija: ${m.roomName || "-"}`, 12, y); y += 5;
    doc.text(`Situacija: ${m.situationNo || "-"}`, 12, y); y += 5;
    doc.text(`Investitor: ${m.investorName || "-"}`, 12, y); y += 8;

    // DIMENZIJE
    doc.setFontSize(13);
    doc.text("Dimenzije prostorije", 12, y);
    y += 6;

    doc.setFontSize(11);
    doc.text(`Dužina: ${fmt(room.D)} m`, 12, y); y += 5;
    doc.text(`Širina: ${fmt(room.S)} m`, 12, y); y += 5;
    doc.text(`Visina: ${fmt(room.V)} m`, 12, y); y += 8;

    // MJERE I FORMULE
    doc.setFontSize(13);
    doc.text("Mjere i formule", 12, y);
    y += 6;

    doc.setFontSize(11);

    // POD
    if (r.pod != null) {
      doc.text(`Pod: ${fmt(r.pod)} m²`, 12, y);
      doc.text(`${fmt(room.D)} × ${fmt(room.S)}`, 80, y);
      y += 5;
    }

    // ZIDOVI NETO
    if (r.zidoviNeto != null) {
      const sub = openings.filter(o => o.subtract).map(o => fmt(o.w * o.h));
      const subTxt = sub.length ? " − " + sub.join(" − ") : "";
      const expr = `2×(${fmt(room.D)} + ${fmt(room.S)})×${fmt(room.V)}${subTxt}`;

      doc.text(`Zidovi neto: ${fmt(r.zidoviNeto)} m²`, 12, y);
      doc.text(expr, 80, y);
      y += 5;
    }

    // HIDRO POD
    if (r.hidroPod != null) {
      doc.text(`Hidro pod: ${fmt(r.hidroPod)} m²`, 12, y); y += 5;
    }

    // HIDRO TUŠ
    if (r.hidroTus != null) {
      doc.text(`Hidro tuš: ${fmt(r.hidroTus)} m²`, 12, y); y += 5;
    }

    // HIDRO TRAKA
    if (r.hidroTraka != null) {
      doc.text(`Hidro traka: ${fmt(r.hidroTraka)} m`, 12, y); y += 5;
    }

    // SILIKON
    if (r.silikon != null) {
      doc.text(`Silikon: ${fmt(r.silikon)} m`, 12, y); y += 5;
    }

    // 10. LAJSNE
    if (r.lajsne != null) {
      const dL = r.lajsneData || { baseL: 0, perimLajsne: 0 };

      doc.setFontSize(13);
      doc.text("10. Lajsne", 12, y);
      y += 6;

      doc.setFontSize(11);
      doc.text(`Ručni unos: ${fmt(dL.baseL)} m`, 14, y); y += 5;
      doc.text(`Rubovi elemenata: ${fmt(dL.perimLajsne)} m`, 14, y); y += 5;
      doc.text(`Ukupno lajsne: ${fmt(r.lajsne)} m`, 14, y); y += 8;
    }

    // 11. GERUNG
    if (r.gerung != null) {
      const dG = r.gerungData || { baseG: 0, perimGerung: 0 };

      doc.setFontSize(13);
      doc.text("11. Gerung", 12, y);
      y += 6;

      doc.setFontSize(11);
      doc.text(`Ručni unos: ${fmt(dG.baseG)} m`, 14, y); y += 5;
      doc.text(`Rubovi elemenata: ${fmt(dG.perimGerung)} m`, 14, y); y += 5;
      doc.text(`Ukupno gerung: ${fmt(r.gerung)} m`, 14, y); y += 8;
    }

    // OTVORI
    doc.setFontSize(13);
    doc.text("Otvori:", 12, y);
    y += 6;

    doc.setFontSize(11);

    openings.forEach(o => {
      const Surf = fmt(o.w * o.h);
      const Obod = fmt(2 * (o.w + o.h));

      doc.text(
        `- ${o.label}: ${fmt(o.w)}×${fmt(o.h)} m, kom ${o.count}, površina=${Surf} m², obod=${Obod} m`,
        12,
        y
      );
      y += 5;
    });
  }

  // -------------------------------------------------------
  // ZADNJA STRANICA — SAŽETAK GRADILIŠTA
  // -------------------------------------------------------

  await newPage();

  let y2 = 20;

  doc.setFontSize(14);
  doc.text("Sažetak gradilišta", 12, y2);
  y2 += 8;

  const site = roomsData[0].meta || {};

  doc.setFontSize(11);
  doc.text(`Gradilište: ${site.siteName || "-"}`, 12, y2); y2 += 5;
  doc.text(`Investitor: ${site.investorName || "-"}`, 12, y2); y2 += 8;

  // CIJENE
  doc.setFontSize(13);
  doc.text("Jedinične cijene", 12, y2);
  y2 += 6;

  const prices = roomsData[0].pricesList || {};
  doc.setFontSize(11);

  Object.keys(prices).forEach(key => {
    const p = prices[key];
    doc.text(`${key}: ${fmt(p.price)} EUR/${p.unit}`, 12, y2);
    y2 += 5;
  });

  y2 += 5;

  // UKUPNI IZNOSI
  doc.setFontSize(13);
  doc.text("Ukupni iznosi", 12, y2);
  y2 += 6;

  let total = 0;
  roomsData.forEach(r => (total += (r.totalPrice || 0)));

  doc.setFontSize(11);
  doc.text(`Ukupna vrijednost svih prostorija: ${fmt(total)} EUR`, 12, y2);
  y2 += 8;

  const contractValue = site.contractValue || 0;
  const prevSituationsTotal = site.prevSituationsTotal || 0;
  const thisSituation = total;
  const remaining = contractValue
    ? contractValue - prevSituationsTotal - thisSituation
    : 0;

  doc.text(
    "Ugovorena vrijednost gradilišta: " +
      (contractValue ? `${fmt(contractValue)} EUR` : "_________ EUR"),
    12,
    y2
  );
  y2 += 6;

  doc.text(
    "Prethodne situacije (ukupno): " +
      (prevSituationsTotal ? `${fmt(prevSituationsTotal)} EUR` : "_________ EUR"),
    12,
    y2
  );
  y2 += 6;

  doc.text(
    "Iznos ove situacije: " +
      (thisSituation ? `${fmt(thisSituation)} EUR` : "_________ EUR"),
    12,
    y2
  );
  y2 += 6;

  doc.text(
    "Preostala vrijednost: " +
      (contractValue ? `${fmt(remaining)} EUR` : "_________ EUR"),
    12,
    y2
  );
  y2 += 10;

  doc.setFontSize(12);
  doc.text("Potpis izvođača: ____________________", 12, y2);

  return doc;
  }
