// JS/pdf/pdfSite.js
import { formatHr, parseNum } from "../core/helpers.js";
import { UNIT_PRICES } from "../calculations/cjenik.js";
import { openingArea, openingPerim } from "../calculations/openings.js";

/**
 * rooms: array objekata
 *  {
 *    D,S,V,
 *    meta: { siteName, roomName, situationNo, investorName, tileFormat },
 *    openings: [],
 *    results: {},
 *    prices: {}
 *  }
 */
export function buildPdfDocumentForSite(rooms) {
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) {
    alert("PDF modul (jsPDF) nije učitan.");
    return null;
  }
  if (!rooms || !rooms.length) {
    alert("Nema podataka za PDF.");
    return null;
  }

  const doc = new jsPDF();
  doc.setFont("helvetica", "normal");
  let y = 15;

  function newPage() {
    doc.addPage();
    doc.setFont("helvetica", "normal");
    y = 15;
  }

  function w(text, extraBottom = 0) {
    const lines = doc.splitTextToSize(text, 190);
    lines.forEach(line => {
      if (y > 280) newPage();
      doc.text(line, 10, y);
      y += 5;
    });
    y += extraBottom;
  }

  function drawHeader(meta) {
    // pokušaj nacrtati logo (ako ne uspije, nema veze)
    try {
      const img = new Image();
      img.src = "logo.png"; // root
      // okvirno mjesto: lijevo gore
      doc.addImage(img, "PNG", 10, 10, 20, 20);
    } catch (e) {
      // ignoriraj – logo nije kritičan
    }

    // tekstualni header desno od loga
    doc.setFontSize(14);
    doc.text("KOB-Keramika", 40, 18);
    doc.setFontSize(10);
    doc.text("Pro obračun prostorije", 40, 24);

    y = 32; // nakon headera
    doc.setFontSize(14);
    doc.text("Građevinska knjiga – obračun prostorije", 10, y);
    y += 10;

    doc.setFontSize(11);
  }

  // ===================== 1) STRANICA PO PROSTORIJI =====================

  rooms.forEach((room, idx) => {
    if (idx > 0) newPage();

    const m = room.meta || {};
    const r = room.results || {};
    const openings = room.openings || [];

    const now = new Date();
    const dStr = `${String(now.getDate()).padStart(2,"0")}.${String(now.getMonth()+1).padStart(2,"0")}.${now.getFullYear()}.`;

    drawHeader(m);

    // OSNOVNI PODACI
    w(`Gradilište: ${m.siteName || "-"}`);
    w(`Prostorija: ${m.roomName || "-"}`);
    w(`Situacija: ${m.situationNo || "-"}`);
    w(`Investitor: ${m.investorName || "-"}`);
    w(`Datum izrade: ${dStr}`, 4);

    // DIMENZIJE
    doc.setFontSize(12);
    w("Dimenzije prostorije:", 2);
    doc.setFontSize(11);
    w(`Dužina (D): ${formatHr(room.D)} m`);
    w(`Širina (S): ${formatHr(room.S)} m`);
    w(`Visina (V): ${formatHr(room.V)} m`, 4);

    // FORMAT PLOČICA – odmah ispod dimenzija
    doc.setFontSize(12);
    w("Format pločica:", 2);
    doc.setFontSize(11);
    const tf = m.tileFormat;
    w(tf && tf.label ? tf.label : "-", 4);

    // MJERE
    doc.setFontSize(12);
    w("Mjere:", 2);
    doc.setFontSize(11);

    // POD
    if (r.pod != null) {
      const formulaPod = `${formatHr(room.D)}×${formatHr(room.S)}`;
      w(`Pod: ${formatHr(r.pod)} m²`);
      w(`Formula: ${formulaPod}`, 4);
    }

    // ZIDOVI NETO
    if (r.zidoviNeto != null) {
      let doorsArea = 0;
      (openings || []).filter(o => o.kind === "door").forEach(o => doorsArea += openingArea(o));
      const formulaZid = `2×(${formatHr(room.D)}+${formatHr(room.S)})×${formatHr(room.V)}−${formatHr(doorsArea)}`;
      w(`Zidovi neto: ${formatHr(r.zidoviNeto)} m²`);
      w(`Formula: ${formulaZid}`, 4);
    }

    // HIDRO POD
    if (r.hidroPod != null) {
      const f = `${formatHr(room.D)}×${formatHr(room.S)}`;
      w(`Hidro pod: ${formatHr(r.hidroPod)} m²`);
      w(`Formula: ${f}`, 4);
    }

    // HIDRO TUŠ
    if (r.hidroTus != null) {
      const f = `${formatHr(room.S)}×${formatHr(room.V)}`;
      w(`Hidro tuš: ${formatHr(r.hidroTus)} m²`);
      w(`Formula: ${f}`, 4);
    }

    // HIDRO TRAKA
    if (r.hidroTraka != null) {
      w(`Hidro traka: ${formatHr(r.hidroTraka)} m`);
      w(`Formula: 2×(D+S)+rubovi prozora/niša`, 4);
    }

    // SILIKON
    if (r.silikon != null) {
      w(`Silikon: ${formatHr(r.silikon)} m`);
      w(`Formula: obod prostorije + rubovi prozora/niša`, 4);
    }

    // SOKL
    if (r.sokl != null) {
      w(`Sokl: ${formatHr(r.sokl)} m`);
      w(`Formula: 2×(D+S)`, 4);
    }

    // LAJSNE / GERUNG
    if (r.lajsne != null) {
      w(`Lajsne / gerung: ${formatHr(r.lajsne)} m`);
      w(`Formula: rubovi prozora/niša/geberita/vertikala`, 4);
    }

    // STEPENICE
    if (r.stepM != null) {
      w(`Stepenice: ${formatHr(r.stepM)} m, ${formatHr(r.stepKom || 0,0)} kom`, 4);
    }

    // DODATNE MJERE
    if (r.dm && r.dm.rows && r.dm.rows.length) {
      doc.setFontSize(12);
      w("Dodatne mjere:", 2);
      doc.setFontSize(11);
      r.dm.rows.forEach((row, i) => {
        w(`${i+1}. ${row.name || "Mjera"}: ${row.sign}${formatHr(row.val)} ⇒ ${formatHr(row.signedVal)}`);
      });
      w(`Ukupno dodatne mjere: ${formatHr(r.dm.total)}`, 4);
    }

    // OTVORI – TABLICA
    if (openings && openings.length) {
      doc.setFontSize(12);
      w("Otvori:", 2);
      doc.setFontSize(11);

      if (y > 260) newPage();

      // zaglavlje tablice
      doc.text("Otvor",      10,  y);
      doc.text("WxH (m)",    50,  y);
      doc.text("Kom",        90,  y);
      doc.text("Površina",   120, y);
      doc.text("Obod",       160, y);
      y += 5;

      openings.forEach(o => {
        if (y > 280) newPage();
        const area = openingArea(o);
        const per  = openingPerim(o);
        const wh   = `${formatHr(o.w)}×${formatHr(o.h)}`;

        doc.text(o.label,              10,  y);
        doc.text(wh,                   50,  y);
        doc.text(String(o.count || 1), 90,  y);
        doc.text(formatHr(area) + " m²", 120, y);
        doc.text(formatHr(per)  + " m",  160, y);
        y += 5;
      });
      y += 4;
    }

    // na stranicama prostorija NEMA cijena – samo mjere
  });

  // ===================== 2) ZADNJA STRANICA – SAŽETAK =====================

  newPage();

  const first = rooms[0];
  const m0 = first.meta || {};
  const now = new Date();
  const dStr = `${String(now.getDate()).padStart(2,"0")}.${String(now.getMonth()+1).padStart(2,"0")}.${now.getFullYear()}.`;

  // header sa logom i tekstom, ali za sažetak malo drugačiji naslov
  try {
    const img = new Image();
    img.src = "logo.png";
    doc.addImage(img, "PNG", 10, 10, 20, 20);
  } catch (e) {}

  doc.setFontSize(14);
  doc.text("KOB-Keramika", 40, 18);
  doc.setFontSize(10);
  doc.text("Pro obračun prostorije", 40, 24);

  y = 32;
  doc.setFontSize(14);
  doc.text("Građevinska knjiga – sažetak gradilišta", 10, y);
  y += 10;

  doc.setFontSize(11);
  w(`Gradilište: ${m0.siteName || "-"}`);
  w(`Investitor: ${m0.investorName || "-"}`);
  w(`Aktualna situacija: ${m0.situationNo || "-"}`);
  w(`Datum izrade: ${dStr}`);

  // formati pločica
  const formatSet = new Set();
  rooms.forEach(rm => {
    const mf = (rm.meta || {}).tileFormat;
    if (mf && mf.label) formatSet.add(mf.label);
  });
  if (formatSet.size) {
    w(`Formati pločica u ovoj situaciji: ${[...formatSet].join(", ")}`, 4);
  } else {
    y += 4;
  }

  // agregacija po stavkama
  const KEYS = [
    { key: "pod",        name: "Pod",           unit: "m²" },
    { key: "zidovi",     name: "Zidovi",        unit: "m²" },
    { key: "hidroPod",   name: "Hidro pod",     unit: "m²" },
    { key: "hidroTus",   name: "Hidro tuš",     unit: "m²" },
    { key: "hidroTraka", name: "Hidro traka",   unit: "m"  },
    { key: "silikon",    name: "Silikon",       unit: "m"  },
    { key: "sokl",       name: "Sokl",          unit: "m"  },
    { key: "lajsne",     name: "Lajsne/gerung", unit: "m"  },
  ];

  const agg = {};
  KEYS.forEach(k => agg[k.key] = { qty: 0, total: 0 });

  rooms.forEach(room => {
    const pr = room.prices || {};
    KEYS.forEach(k => {
      const it = pr[k.key];
      if (!it || !it.qty) return;
      const price = UNIT_PRICES[k.key] || 0;
      agg[k.key].qty   += it.qty;
      agg[k.key].total += it.qty * price;
    });
  });

  // tablica financija
  if (y > 260) newPage();
  doc.setFontSize(12);
  w("Financijski obračun – sažetak svih prostorija:", 2);

  if (y > 280) newPage();
  doc.setFontSize(11);

  doc.text("Stavka",     10,  y);
  doc.text("Količina",   70,  y);
  doc.text("Jed.",       100, y);
  doc.text("Jed. cijena",120, y);
  doc.text("Ukupno",     160, y);
  y += 5;

  let totalSituation = 0;

  KEYS.forEach(k => {
    const row = agg[k.key];
    if (!row || !row.qty) return;
    const price = UNIT_PRICES[k.key] || 0;
    const total = row.total;
    totalSituation += total;

    if (y > 280) newPage();
    doc.text(k.name,                 10,  y);
    doc.text(formatHr(row.qty),      70,  y);
    doc.text(k.unit,                 100, y);
    doc.text(formatHr(price, 2),     120, y);
    doc.text(formatHr(total, 2),     160, y);
    y += 5;
  });

  y += 4;
  w(`UKUPNO vrijednost ove situacije: ${formatHr(totalSituation, 2)} EUR`, 4);

  // UGOVOR I SITUACIJE – ručni unos
  const ugovorStr = prompt("Ukupna vrijednost ugovora za ovo gradilište (EUR):", "0");
  const ranijeStr = prompt("Ukupan iznos ranije situiranih računa (S-1..S-n) (EUR):", "0");

  const ugovor = parseNum(ugovorStr);
  const ranije = parseNum(ranijeStr);
  const ukupnoSituirano = ranije + totalSituation;
  const preostalo = ugovor - ukupnoSituirano;

  doc.setFontSize(12);
  w("Sažetak ugovora:", 2);
  doc.setFontSize(11);
  w(`Ukupna ugovorna vrijednost: ${formatHr(ugovor, 2)} EUR`);
  w(`Ranije situirano (S-1..S-n): ${formatHr(ranije, 2)} EUR`);
  w(`Ova situacija: ${formatHr(totalSituation, 2)} EUR`);
  w(`Ukupno situirano (uklj. ovu situaciju): ${formatHr(ukupnoSituirano, 2)} EUR`);
  w(`Preostala vrijednost za situirati: ${formatHr(preostalo, 2)} EUR`, 4);

  return doc;
                                                                  }
