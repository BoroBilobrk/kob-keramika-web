// JS/pdf/pdfSite.js
// PDF za GRADILIŠTE (više prostorija)

const { jsPDF } = window.jspdf;
import { ensureRoboto } from "./fontRoboto.js";
import { formatHr } from "../core/helpers.js";

export async function buildPdfDocumentForSite(roomsData = []) {
  if (!roomsData || roomsData.length === 0) return null;

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

  let page = 1;

  // ---------------- HEADER ----------------
  function drawHeader() {
    // logo (uzima isti logo kao u headeru stranice, ako postoji)
    try {
      const img = document.querySelector("header img.logo");
      if (img) {
        doc.addImage(img, "PNG", 10, 6, 18, 18);
      }
    } catch (e) {
      // ako ne uspije – preskoči logo
    }

    doc.setFontSize(10);
    doc.text("Građevinska knjiga – obračun prostorije", 30, 12);
    doc.text(`Stranica ${page}`, 200 - 10, 12, { align: "right" });

    doc.setFontSize(11);
    doc.setFont("Roboto", "normal");
    if (doc.setCharSpace) doc.setCharSpace(0);

    // okvir
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.rect(8, 14, 194, 270);
  }

  async function newPage() {
    doc.addPage();
    page++;
    await ensureRoboto(doc);
    doc.setFont("Roboto", "normal");
    doc.setFontSize(11);
    if (doc.setCharSpace) doc.setCharSpace(0);
    drawHeader();
  }

  drawHeader();

  // pomoćni format
  const fmt = (x, dec = 2) =>
    typeof x === "number"
      ? x.toFixed(dec).replace(".", ",")
      : String(x ?? "").replace(".", ",");

  // ---------------- SVAKA PROSTORIJA ----------------
  for (let i = 0; i < roomsData.length; i++) {
    const room = roomsData[i];
    const m = room.meta || {};
    const r = room.results || {};
    const openings = room.openings || [];

    // prve stranice ne radimo newPage
    if (i > 0) await newPage();

    let y = 22;

    // PODACI O GRADILIŠTU
    doc.setFontSize(13);
    doc.text("Podaci o gradilištu", 12, y); y += 6;
    doc.setFontSize(11);
    doc.text(`Gradilište: ${m.siteName || "-"}`, 12, y); y += 5;
    doc.text(`Prostorija: ${m.roomName || "-"}`, 12, y); y += 5;
    doc.text(`Situacija: ${m.situationNo || "-"}`, 12, y); y += 5;
    doc.text(`Investitor: ${m.investorName || "-"}`, 12, y); y += 8;

    // DIMENZIJE
    doc.setFontSize(13);
    doc.text("Dimenzije prostorije", 12, y); y += 6;
    doc.setFontSize(11);
    doc.text(`Dužina: ${fmt(room.D)} m`, 12, y); y += 5;
    doc.text(`Širina: ${fmt(room.S)} m`, 12, y); y += 5;
    doc.text(`Visina: ${fmt(room.V)} m`, 12, y); y += 8;

    // MJERE I FORMULE
    doc.setFontSize(13);
    doc.text("Mjere i formule", 12, y); y += 6;
    doc.setFontSize(11);

    // Pod
    if (m.chkPod && r.pod != null) {
      doc.text(`Pod: ${fmt(r.pod)} m²`, 12, y);
      doc.text(`${fmt(room.D)} × ${fmt(room.S)}`, 85, y);
      y += 5;
    }

    // Zidovi neto
    if (m.chkZidovi && r.zidoviNeto != null) {
      const expr = `2×(${fmt(room.D)} + ${fmt(room.S)})×${fmt(room.V)}`;
      doc.text(`Zidovi neto: ${fmt(r.zidoviNeto)} m²`, 12, y);
      doc.text(expr, 85, y);
      y += 5;
    }

    // Hidro pod
    if (m.chkHidro && r.hidroPod != null) {
      doc.text(`Hidro pod: ${fmt(r.hidroPod)} m²`, 12, y); y += 5;
    }

    // Hidro tuš
    if (m.chkHidro && r.hidroTus != null) {
      doc.text(`Hidro tuš: ${fmt(r.hidroTus)} m²`, 12, y); y += 5;
    }

    // Hidro traka
    if (m.chkHidroTraka && r.hidroTraka != null) {
      doc.text(`Hidro traka: ${fmt(r.hidroTraka)} m`, 12, y); y += 5;
    }

    // Silikon
    if (m.chkSilikon && r.silikon != null) {
      doc.text(`Silikon: ${fmt(r.silikon)} m`, 12, y); y += 5;
    }

    // Sokl
    if (m.chkSokl && r.sokl != null) {
      doc.text(`Sokl: ${fmt(r.sokl)} m`, 12, y); y += 5;
    }

    // 10. Lajsne
    if (m.chkLajsne && r.lajsne != null) {
      const d = r.lajsneData || { baseL: 0, perimLajsne: 0 };
      doc.setFontSize(13);
      doc.text("10. Lajsne", 12, y); y += 6;
      doc.setFontSize(11);
      doc.text(`Ručni unos: ${fmt(d.baseL)} m`, 14, y); y += 5;
      doc.text(`Rubovi elemenata: ${fmt(d.perimLajsne)} m`, 14, y); y += 5;
      doc.text(`Ukupno lajsne: ${fmt(r.lajsne)} m`, 14, y); y += 8;
    }

    // 11. Gerung
    if (m.chkGerung && r.gerung != null) {
      const d = r.gerungData || { baseG: 0, perimGerung: 0 };
      doc.setFontSize(13);
      doc.text("11. Gerung", 12, y); y += 6;
      doc.setFontSize(11);
      doc.text(`Ručni unos: ${fmt(d.baseG)} m`, 14, y); y += 5;
      doc.text(`Rubovi elemenata: ${fmt(d.perimGerung)} m`, 14, y); y += 5;
      doc.text(`Ukupno gerung: ${fmt(r.gerung)} m`, 14, y); y += 8;
    }

    // OTVORI
    doc.setFontSize(13);
    doc.text("Otvori:", 12, y); y += 6;
    doc.setFontSize(11);

    openings.forEach(o => {
      const pov = o.w * o.h;
      const obod = 2 * (o.w + o.h);
      const line = `- ${o.label}: ${fmt(o.w)}×${fmt(o.h)} m, kom ${o.count}, ` +
                   `površina=${fmt(pov)} m², obod=${fmt(obod)} m`;
      doc.text(line, 12, y);
      y += 5;
    });
  }

  // ---------------- SAŽETAK GRADILIŠTA ----------------
  await newPage();

  let y2 = 22;
  const siteMeta = roomsData[0].meta || {};
  const prices = roomsData[0].prices || {};

  doc.setFontSize(13);
  doc.text("Sažetak gradilišta", 12, y2); y2 += 8;

  doc.setFontSize(11);
  doc.text(`Gradilište: ${siteMeta.siteName || "-"}`, 12, y2); y2 += 5;
  doc.text(`Investitor: ${siteMeta.investorName || "-"}`, 12, y2); y2 += 8;

  // Jedinične cijene
  doc.setFontSize(13);
  doc.text("Jedinične cijene", 12, y2); y2 += 6;
  doc.setFontSize(11);

  const labelMap = {
    pod:        "pod",
    zidovi:     "zidovi",
    hidroPod:   "hidro pod",
    hidroTus:   "hidro tuš",
    hidroTraka: "hidro traka",
    silikon:    "silikon",
    sokl:       "sokl",
    lajsne:     "lajsne",
    gerung:     "gerung"
  };

  Object.keys(prices).forEach(key => {
    const p = prices[key];
    if (!p) return;
    const label = labelMap[key] || key;
    doc.text(
      `${label}: ${fmt(p.price)} EUR/${p.unit || ""}`,
      14,
      y2
    );
    y2 += 5;
  });

  y2 += 6;

  // Ukupni iznosi
  doc.setFontSize(13);
  doc.text("Ukupni iznosi", 12, y2); y2 += 6;
  doc.setFontSize(11);

  const totalAllRooms = roomsData.reduce(
    (sum, r) => sum + (r.totalPrice || 0),
    0
  );

  doc.text(
    `Ukupna vrijednost svih prostorija: ${fmt(totalAllRooms)} EUR`,
    14,
    y2
  );
  y2 += 8;

  const contract = siteMeta.contractValue || 0;
  const prevSituations = siteMeta.previousSituationsTotal || 0;
  const remaining = contract - prevSituations - totalAllRooms;

  doc.text(
    `Ugovorena vrijednost gradilišta: ${fmt(contract)} EUR`,
    14,
    y2
  );
  y2 += 5;

  doc.text(
    `Prethodne situacije (ukupno): ${fmt(prevSituations)} EUR`,
    14,
    y2
  );
  y2 += 5;

  doc.text(
    `Iznos ove situacije: ${fmt(totalAllRooms)} EUR`,
    14,
    y2
  );
  y2 += 5;

  doc.text(
    `Preostala vrijednost: ${fmt(remaining)} EUR`,
    14,
    y2
  );
  y2 += 10;

  doc.setFontSize(12);
  doc.text("Potpis izvođača: ____________________", 12, y2);

  return doc;
             }
