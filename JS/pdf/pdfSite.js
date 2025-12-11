// JS/pdf/pdfSite.js
import { formatHr } from "../core/helpers.js";
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
  let y = 15;

  function newPage() {
    doc.addPage();
    y = 15;
  }

  function w(text, extra = 0) {
    const lines = doc.splitTextToSize(text, 190);
    lines.forEach(line => {
      if (y > 280) newPage();
      doc.text(line, 10, y);
      y += 5;
    });
    y += extra;
  }

  // =============== 1) STRANICE PO PROSTORIJAMA ===============

  rooms.forEach((room, idx) => {
    if (idx > 0) newPage();

    const m = room.meta || {};
    const r = room.results || {};
    const openings = room.openings || [];

    const now = new Date();
    const dStr = `${String(now.getDate()).padStart(2,"0")}.${String(now.getMonth()+1).padStart(2,"0")}.${now.getFullYear()}.`;

    doc.setFontSize(14);
    w("Građevinska knjiga – obračun prostorije", 8);

    doc.setFontSize(11);
    w(`Gradilište: ${m.siteName || "-"}`);
    w(`Prostorija: ${m.roomName || "-"}`);
    w(`Situacija: ${m.situationNo || "-"}`);
    w(`Investitor: ${m.investorName || "-"}`);
    w(`Format pločica: ${m.tileFormat ? m.tileFormat.label : "-"}`);
    w(`Datum izrade: ${dStr}`, 4);

    // Dimenzije i formule
    w("Dimenzije prostorije:", 2);
    w(`Dužina (D): ${formatHr(room.D)} m`);
    w(`Širina (S): ${formatHr(room.S)} m`);
    w(`Visina (V): ${formatHr(room.V)} m`, 4);

    w("Mjere i formule:", 2);

    // Pod
    if (r.pod != null) {
      const formulaPod = `${formatHr(room.D)}×${formatHr(room.S)}`;
      w(`Pod: ${formatHr(r.pod)} m²  (formula: ${formulaPod})`);
    }

    // Zidovi
    if (r.zidoviNeto != null) {
      let doorsArea = 0;
      (openings || []).filter(o => o.kind === "door").forEach(o => doorsArea += openingArea(o));
      const formulaZid = `2×(${formatHr(room.D)}+${formatHr(room.S)})×${formatHr(room.V)} − ${formatHr(doorsArea)} (Σ vrata)`;
      w(`Zidovi neto: ${formatHr(r.zidoviNeto)} m²  (formula: ${formulaZid})`);
    }

    // Hidro
    if (r.hidroPod != null) {
      const f = `${formatHr(room.D)}×${formatHr(room.S)}`;
      w(`Hidro pod: ${formatHr(r.hidroPod)} m²  (formula: ${f})`);
    }
    if (r.hidroTus != null) {
      const f = `${formatHr(room.S)}×${formatHr(room.V)}`;
      w(`Hidro tuš: ${formatHr(r.hidroTus)} m²  (formula: ${f})`);
    }

    // Hidro traka
    if (r.hidroTraka != null) {
      w(`Hidro traka: ${formatHr(r.hidroTraka)} m (formula: 2×(D+S) + rubovi prozora/niša)`);
    }

    // Silikon
    if (r.silikon != null) {
      w(`Silikon: ${formatHr(r.silikon)} m (formula: obod prostorije + rubovi prozora/niša)`);
    }

    // Sokl
    if (r.sokl != null) {
      w(`Sokl: ${formatHr(r.sokl)} m (formula: 2×(D+S))`);
    }

    // Lajsne / gerung
    if (r.lajsne != null) {
      w(`Lajsne / gerung: ${formatHr(r.lajsne)} m (formula: rubovi prozora/niša/geberita/vertikala)`);
    }

    // Stepenice
    if (r.stepM != null) {
      w(`Stepenice: ${formatHr(r.stepM)} m, ${formatHr(r.stepKom || 0,0)} kom`);
    }

    // Dodatne mjere
    if (r.dm && r.dm.rows && r.dm.rows.length) {
      w("Dodatne mjere:", 2);
      r.dm.rows.forEach((row, i) => {
        w(`${i+1}. ${row.name || "Mjera"}: ${row.sign}${formatHr(row.val)} ⇒ ${formatHr(row.signedVal)}`);
      });
      w(`Ukupno dodatne mjere: ${formatHr(r.dm.total)}`, 4);
    }

    // Otvori
    if (openings && openings.length) {
      w("Otvori:", 2);
      openings.forEach(o => {
        w(`- ${o.label}: ${formatHr(o.w)}×${formatHr(o.h)} m, kom ${o.count}, površina=${formatHr(openingArea(o))} m², obod=${formatHr(openingPerim(o))} m`);
      });
    }

    // na stranicama prostorija NEMA cijena po stavkama – samo mjere
  });

  // =============== 2) ZADNJA STRANICA – SAŽETAK GRADILIŠTA ===============

  newPage();

  const first = rooms[0];
  const m0 = first.meta || {};
  const now = new Date();
  const dStr = `${String(now.getDate()).padStart(2,"0")}.${String(now.getMonth()+1).padStart(2,"0")}.${now.getFullYear()}.`;

  doc.setFontSize(14);
  w("Građevinska knjiga – sažetak gradilišta", 8);

  doc.setFontSize(11);
  w(`Gradilište: ${m0.siteName || "-"}`);
  w(`Investitor: ${m0.investorName || "-"}`);
  w(`Aktualna situacija: ${m0.situationNo || "-"}`);
  w(`Datum izrade: ${dStr}`);

  // Popis formata pločica koji se pojavljuju
  const formatSet = new Set();
  rooms.forEach(r => {
    const mf = (r.meta || {}).tileFormat;
    if (mf && mf.label) formatSet.add(mf.label);
  });
  if (formatSet.size) {
    w(`Formati pločica u ovoj situaciji: ${[...formatSet].join(", ")}`, 4);
  } else {
    y += 4;
  }

  // Agregacija po stavkama
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

  // tablica
  if (y > 260) newPage();
  doc.setFontSize(12);
  w("Financijski obračun – sažetak svih prostorija:", 2);

  if (y > 280) newPage();
  doc.setFontSize(11);

  doc.text("Stavka",     10, y);
  doc.text("Količina",   70, y);
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
    doc.text(k.name,                10,  y);
    doc.text(formatHr(row.qty),     70,  y);
    doc.text(k.unit,                100, y);
    doc.text(formatHr(price, 2),    120, y);
    doc.text(formatHr(total, 2),    160, y);
    y += 5;
  });

  y += 4;
  w(`UKUPNO vrijednost ove situacije: ${formatHr(totalSituation, 2)} EUR`, 4);

  // 3) Ugovor i ranije situacije – ručni unos
  const ugovorStr = prompt("Ukupna vrijednost ugovora za ovo gradilište (EUR):", "0");
  const ranijeStr = prompt("Ukupan iznos ranije situiranih računa (S-1..S-n) (EUR):", "0");

  const ugovor = parseFloat((ugovorStr || "0").replace(",", ".")) || 0;
  const ranije = parseFloat((ranijeStr || "0").replace(",", ".")) || 0;
  const ukupnoSituirano = ranije + totalSituation;
  const preostalo = ugovor - ukupnoSituirano;

  w("Sažetak ugovora:", 2);
  w(`Ukupna ugovorna vrijednost: ${formatHr(ugovor, 2)} EUR`);
  w(`Ranije situirano (S-1..S-n): ${formatHr(ranije, 2)} EUR`);
  w(`Ova situacija: ${formatHr(totalSituation, 2)} EUR`);
  w(`Ukupno situirano (uklj. ovu situaciju): ${formatHr(ukupnoSituirano, 2)} EUR`);
  w(`Preostala vrijednost za situirati: ${formatHr(preostalo, 2)} EUR`, 4);

  return doc;
          }
