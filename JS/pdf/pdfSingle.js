// JS/pdf/pdfSingle.js
// PDF za pojedinačnu prostoriju (Građevinska knjiga)

const { jsPDF } = window.jspdf;
import { ensureRoboto } from "./fontRoboto.js";
import { formatHr, parseNum } from "../core/helpers.js";
import { buildPdfDocumentForSite } from "./pdfSite.js";
import { getPricesForCurrentFormat } from "../calculations/cjenik.js";
import { getOpenings, openingArea, openingPerim } from "../calculations/openings.js";

function fmt(num, dec = 2) {
  return formatHr(num, dec);
}

function readNum(id, fallback = 0) {
  const val = document.getElementById(id)?.value;
  if (val == null || val === "") return fallback;
  return parseNum(val);
}

function getTileFormatLabel() {
  const select = document.getElementById("tileFormatSelect");
  const val = select?.value || "";
  if (!val) return "";
  if (val !== "custom") return `${val} cm`;
  const w = document.getElementById("tileW")?.value || "";
  const h = document.getElementById("tileH")?.value || "";
  return w && h ? `${w}×${h} cm` : "";
}

export async function buildPdfDocument(data = {}) {
  if (!data || !data.results) return null;

  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait"
  });

  await ensureRoboto(doc);
  doc.setFont("Roboto", "normal");
  doc.setFontSize(10);
  if (doc.setCharSpace) doc.setCharSpace(0);

  const meta = data.meta || {};
  const dims = data.dims || {};
  const results = data.results || {};

  const investor = meta.investorName || "-";
  const gradjevina = meta.siteName || "-";
  const roomName = meta.roomName || "";
  const situationNo = meta.situationNo || "";
  const redniBroj = document.getElementById("siteCode")?.value || "";

  const tileFormat = getTileFormatLabel();
  const opisRadova = [tileFormat, roomName].filter(Boolean).join(" - ");

  const { formatPrices, unitPrices } = getPricesForCurrentFormat();

  const items = [
    { key: "pod", label: "Pod", unit: "m²", unitPrice: formatPrices?.pod ?? unitPrices?.pod ?? 0 },
    { key: "zidovi", label: "Zidovi", unit: "m²", unitPrice: formatPrices?.zidovi ?? unitPrices?.zidovi ?? 0 },
    { key: "hidroPod", label: "Hidro pod", unit: "m²", unitPrice: unitPrices?.hidroPod ?? 0 },
    { key: "hidroTus", label: "Hidro tuš", unit: "m²", unitPrice: unitPrices?.hidroTus ?? 0 },
    { key: "hidroTraka", label: "Hidro traka", unit: "m", unitPrice: unitPrices?.hidroTraka ?? 0 },
    { key: "silikon", label: "Silikon", unit: "m", unitPrice: unitPrices?.silikon ?? 0 },
    { key: "sokl", label: "Sokl", unit: "m", unitPrice: unitPrices?.sokl ?? 0 },
    { key: "lajsne", label: "Lajsne", unit: "m", unitPrice: unitPrices?.lajsne ?? 0 },
    { key: "gerung", label: "Gerung", unit: "m", unitPrice: unitPrices?.gerung ?? 0 },
    { key: "stepenice", label: "Stepenice", unit: "m", unitPrice: 0 }
  ].filter(item => Number(results[item.key] || 0) !== 0);

  const frameX = 10;
  const frameY = 28;
  const frameW = 190;
  const frameH = 255;

  const drawFrame = () => {
    doc.setLineWidth(0.2);
    doc.rect(frameX, frameY, frameW, frameH);

    doc.setFontSize(8);
    doc.text("KOB - KERAMIKA", frameX + 4, frameY + 6);
    doc.text("Vl. Slobodan Bilobrk", frameX + 4, frameY + 10);

    try {
      const img = document.querySelector("header img.logo");
      if (img) {
        doc.addImage(img, "PNG", frameX + 70, frameY + 2, 20, 20);
      }
    } catch (e) {
      // ignore logo errors
    }

    doc.setFontSize(9);
    doc.text(`Situacija: ${situationNo || "-"}`, frameX + frameW - 4, frameY + 6, { align: "right" });

    doc.setLineWidth(0.2);
    doc.line(frameX, frameY + 20, frameX + frameW, frameY + 20);
  };

  const newPage = async () => {
    doc.addPage();
    await ensureRoboto(doc);
    doc.setFont("Roboto", "normal");
    doc.setFontSize(10);
    if (doc.setCharSpace) doc.setCharSpace(0);
    drawFrame();
  };

  drawFrame();

  let y = frameY + 28;
  doc.setFontSize(12);
  doc.text("INVESTITOR:", frameX + 4, y);
  doc.text(investor, frameX + 55, y);
  y += 8;

  doc.text("GRAĐEVINA:", frameX + 4, y);
  doc.text(gradjevina, frameX + 55, y);
  y += 8;

  doc.text("OPIS RADOVA:", frameX + 4, y);
  doc.text(opisRadova || "-", frameX + 55, y);
  y += 8;

  doc.setFontSize(10);
  doc.text("Redni broj po troškovniku:", frameX + 4, y);
  doc.text(redniBroj || "-", frameX + 70, y);
  y += 6;

  const colX = [frameX + 2, frameX + 60, frameX + 78, frameX + 108, frameX + 140, frameX + 168, frameX + 188];
  const headerY = y + 4;

  doc.setFontSize(8);
  doc.setLineWidth(0.2);
  doc.line(colX[0], headerY - 4, colX[6], headerY - 4);
  doc.line(colX[0], headerY + 8, colX[6], headerY + 8);

  for (let i = 0; i < colX.length; i++) {
    doc.line(colX[i], headerY - 4, colX[i], headerY + 8 + 6 * Math.max(items.length, 3));
  }

  doc.text("Stavka", colX[0] + 2, headerY);
  doc.text("Jed. mj.", colX[1] + 2, headerY);
  doc.text("Ugovorena", colX[2] + 2, headerY);
  doc.text("količina", colX[2] + 2, headerY + 4);
  doc.text("Jed. cijena €", colX[3] + 2, headerY);
  doc.text("Mjesečno", colX[4] + 2, headerY);
  doc.text("Ukupno", colX[5] + 2, headerY);

  let rowY = headerY + 12;
  doc.setFontSize(9);

  if (!items.length) {
    doc.text("Nema stavki.", colX[0] + 2, rowY);
    rowY += 6;
  } else {
    items.forEach(item => {
      const qty = Number(results[item.key] || 0);
      const unitPrice = Number(item.unitPrice || 0);
      const monthly = qty;
      const total = monthly;

      doc.text(item.label, colX[0] + 2, rowY);
      doc.text(item.unit, colX[1] + 2, rowY);
      doc.text("-", colX[2] + 2, rowY);
      doc.text(unitPrice ? fmt(unitPrice, 2) : "-", colX[3] + 2, rowY);
      doc.text(fmt(monthly, 2), colX[4] + 2, rowY);
      doc.text(fmt(total, 2), colX[5] + 2, rowY);

      rowY += 6;
    });
  }

  y = headerY + 12 + 6 * Math.max(items.length, 3) + 8;
  if (y > 250) {
    await newPage();
    y = frameY + 26;
  }

  doc.setFontSize(11);
  doc.text("Dokaznica mjera", frameX + 4, y);
  y += 6;

  const D = dims.D ?? readNum("dimD", 0);
  const S = dims.S ?? readNum("dimS", 0);
  const V = dims.V ?? readNum("dimV", 0);

  const tusA = readNum("tusA", 0);
  const tusB = readNum("tusB", 0);
  const tusV = readNum("tusV", 0);

  const stepM = readNum("stepM", 0);
  const stepK = readNum("stepKom", 0);

  const openings = getOpenings() || [];
  const doorOpenings = openings.filter(o => o.kind === "door");
  const lajsneOpenings = openings.filter(o => o.kind === "window" || o.kind === "niche" || o.kind === "geberit" || o.kind === "vert");

  const lines = [];

  if (results.pod) {
    lines.push(`Pod: D × Š = ${fmt(D)} × ${fmt(S)} = ${fmt(results.pod)} m²`);
  }

  if (results.zidovi) {
    const zidoviBrutto = 2 * (D + S) * V;
    lines.push(`Zidovi: 2 × (D + Š) × V = 2 × (${fmt(D)} + ${fmt(S)}) × ${fmt(V)} = ${fmt(zidoviBrutto)} m²`);
    if (doorOpenings.length) {
      doorOpenings.forEach(o => {
        const pov = openingArea(o);
        lines.push(`- Vrata ${o.label}: ${fmt(o.w)} × ${fmt(o.h)} × ${o.count} = ${fmt(pov)} m²`);
      });
    }
    lines.push(`Ukupno zidovi: ${fmt(results.zidovi)} m²`);
  }

  if (results.hidroPod) {
    lines.push(`Hidro pod: D × Š = ${fmt(D)} × ${fmt(S)} = ${fmt(results.hidroPod)} m²`);
  }

  if (results.hidroTus) {
    lines.push(`Hidro tuš: (A + B) × V = (${fmt(tusA)} + ${fmt(tusB)}) × ${fmt(tusV)} = ${fmt(results.hidroTus)} m²`);
  }

  if (results.hidroTraka) {
    lines.push(`Hidro traka: 2 × (D + Š) + (A + B + V) = ${fmt(results.hidroTraka)} m`);
  }

  if (results.silikon) {
    lines.push(`Silikon: 2 × (D + Š) = ${fmt(results.silikon)} m`);
  }

  if (results.sokl) {
    lines.push(`Sokl: 2 × (D + Š) = ${fmt(results.sokl)} m`);
  }

  if (results.stepenice) {
    lines.push(`Stepenice: M × kom = ${fmt(stepM)} × ${fmt(stepK, 0)} = ${fmt(results.stepenice)} m`);
  }

  if (results.lajsne || results.gerung) {
    const base = lajsneOpenings.reduce((sum, o) => sum + openingPerim(o), 0) + (results.stepenice || 0);
    const label = results.lajsne ? "Lajsne" : "Gerung";
    lines.push(`${label}: zbroj oboda otvora + stepenice = ${fmt(base)} m`);
    lajsneOpenings.forEach(o => {
      const obod = openingPerim(o);
      lines.push(`- ${o.label}: 2 × (${fmt(o.w)} + ${fmt(o.h)}) × ${o.count} = ${fmt(obod)} m`);
    });
  }

  doc.setFontSize(9);
  for (const line of lines) {
    if (y > 270) {
      await newPage();
      y = frameY + 26;
      doc.setFontSize(9);
    }
    doc.text(line, frameX + 4, y);
    y += 5;
  }

  return doc;
}

export { buildPdfDocumentForSite };