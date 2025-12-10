// js/pdf/pdfSingle.js
import { formatHr } from "../core/helpers.js";
import { UNIT_PRICES } from "../calculations/cjenik.js";
import { openingArea, openingPerim } from "../calculations/openings.js";

export function buildPdfDocument(data) {
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) {
    alert("PDF modul nije učitan.");
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

  const m = data.meta || {};
  const r = data.results || {};
  const today = new Date();
  const dStr = `${String(today.getDate()).padStart(2,"0")}.${String(today.getMonth()+1).padStart(2,"0")}.${today.getFullYear()}.`;

  doc.setFontSize(14);
  doc.text("Građevinska knjiga – obračun prostorije", 10, y);
  y += 10;

  doc.setFontSize(11);
  w(`Gradilište: ${m.siteName || "-"}`);
  w(`Prostorija: ${m.roomName || "-"}`);
  w(`Situacija: ${m.situationNo || "-"}`);
  w(`Format pločice: ${m.tileFormat ? m.tileFormat.label : "-"}`);
  w(`Datum izrade: ${dStr}`, 4);

  if (r.pod != null)        w(`Pod: ${formatHr(r.pod)} m²`);
  if (r.zidoviNeto != null) w(`Zidovi neto: ${formatHr(r.zidoviNeto)} m²`);
  if (r.hidroPod != null)   w(`Hidro pod: ${formatHr(r.hidroPod)} m²`);
  if (r.hidroTus != null)   w(`Hidro tuš zona: ${formatHr(r.hidroTus)} m²`);
  if (r.hidroTraka != null) w(`Hidro traka: ${formatHr(r.hidroTraka)} m`);
  if (r.silikon != null)    w(`Silikon: ${formatHr(r.silikon)} m`);
  if (r.sokl != null)       w(`Sokl: ${formatHr(r.sokl)} m`);
  if (r.lajsne != null)     w(`Lajsne: ${formatHr(r.lajsne)} m`);

  if (r.dm && r.dm.rows && r.dm.rows.length) {
    w("Dodatne mjere:", 2);
    r.dm.rows.forEach((row, i) => {
      w(`${i+1}. ${row.name}: ${row.sign}${formatHr(row.val)} ⇒ ${formatHr(row.signedVal)}`);
    });
    w(`Ukupno dodatne mjere = ${formatHr(r.dm.total)}`, 4);
  }

  if (data.openings?.length) {
    w("Otvori:", 2);
    data.openings.forEach(o => {
      w(`- ${o.label}: ${formatHr(o.w)}×${formatHr(o.h)} m, kom ${o.count}, ` +
        `površina=${formatHr(openingArea(o))} m², obod=${formatHr(openingPerim(o))} m`);
    });
  }

  const p = data.prices || {};
  const rows = [];
  let grand = 0;

  function add(name, key) {
    const it = p[key];
    if (!it) return;
    const qty = it.qty;
    const unit = it.unit;
    const price = UNIT_PRICES[key] || 0;
    const total = qty * price;
    grand += total;
    rows.push({ name, qty, unit, price, total });
  }

  add("Pod", "pod");
  add("Zidovi", "zidovi");
  add("Hidro pod", "hidroPod");
  add("Hidro tuš", "hidroTus");
  add("Hidro traka", "hidroTraka");
  add("Silikon", "silikon");
  add("Sokl", "sokl");
  add("Lajsne", "lajsne");

  if (rows.length) {
    w("Financijski obračun:", 2);
    rows.forEach(rr => {
      w(`${rr.name}: ${formatHr(rr.qty)} ${rr.unit} × ${formatHr(rr.price,2)} = ${formatHr(rr.total,2)} EUR`);
    });
    w(`UKUPNO: ${formatHr(grand,2)} EUR`, 4);
  }

  return doc;
}
