// JS/cloud/cloudSave.js
import { AppState } from "../core/state.js";
import { buildPdfDocumentSingle } from "../pdf/pdfSingle.js";
import { buildPdfDocumentForSite } from "../pdf/pdfSite.js";
import { db, storage } from "./firebase-init.js";
import { $, parseNum } from "../core/helpers.js";

// pomoćna: izračun ukupne cijene situacije iz rooms[*].prices
function calcTotalFromRooms(rooms) {
  let total = 0;
  rooms.forEach(r => {
    const p = r.prices || {};
    Object.keys(p).forEach(key => {
      const item = p[key];
      if (!item) return;
      const qty = parseNum(item.qty);
      const price = parseNum(item.price);
      if (!isNaN(qty) && !isNaN(price)) {
        total += qty * price;
      }
    });
  });
  return total;
}

// pomoćna: izvuci broj situacije iz stringa (npr. "S-12" → 12)
function extractSituationOrder(sitStr) {
  if (!sitStr) return 0;
  const m = String(sitStr).match(/\d+/);
  if (!m) return 0;
  const n = parseInt(m[0], 10);
  return isNaN(n) ? 0 : n;
}

export async function saveToCloud(data) {
  try {
    // rooms: ili cijelo gradilište (AppState.siteRooms) ili samo trenutna prostorija
    const rooms = AppState.siteRooms.length ? AppState.siteRooms : [data];

    // meta iz kalkulacije
    const meta = data.meta || {};

    // pročitaj ugovorenu vrijednost gradilišta iz UI (novo polje)
    const contractValue = parseNum($("#contractValue")?.value || "0");

    // pobrini se da su osnovni meta podaci postavljeni
    meta.siteName      = meta.siteName      || $("#siteName")?.value.trim()     || "";
    meta.roomName      = meta.roomName      || $("#roomName")?.value.trim()     || "";
    meta.situationNo   = meta.situationNo   || $("#situationNo")?.value.trim()  || "";
    meta.investorName  = meta.investorName  || $("#investorName")?.value.trim() || "";
    meta.contractValue = contractValue;

    // broj situacije za sortiranje
    const situationOrder = extractSituationOrder(meta.situationNo);
    meta.situationOrder = situationOrder;

    // proširi meta na sve prostorije (da pdfSite.js ima iste podatke)
    rooms.forEach(r => {
      r.meta = {
        ...(r.meta || {}),
        siteName: meta.siteName,
        roomName: r.meta?.roomName || meta.roomName,
        situationNo: meta.situationNo,
        investorName: meta.investorName,
        contractValue,
        situationOrder
      };
    });

    // izračunaj ukupnu vrijednost ove situacije iz svih prostorija
    const totalPrice = calcTotalFromRooms(rooms);

    // izračunaj prethodne situacije iz Clouda (za isto gradilište, manji situationOrder)
    let prevSituationsTotal = 0;
    if (meta.siteName && situationOrder > 0) {
      const prevSnap = await db
        .collection("obracuni")
        .where("meta.siteName", "==", meta.siteName)
        .get();

      prevSnap.forEach(doc => {
        const dPrev = doc.data();
        const mPrev = dPrev.meta || {};
        const ordPrev = mPrev.situationOrder || 0;
        if (ordPrev > 0 && ordPrev < situationOrder) {
          const tp = dPrev.totalPrice || 0;
          if (typeof tp === "number" && !isNaN(tp)) {
            prevSituationsTotal += tp;
          }
        }
      });
    }

    meta.prevSituationsTotal = prevSituationsTotal;

    // upiši prevSituationsTotal i u meta svake prostorije (pdfSite.js čita iz rooms[0].meta)
    rooms.forEach(r => {
      r.meta = {
        ...(r.meta || {}),
        contractValue,
        situationOrder,
        prevSituationsTotal
      };
    });

    // 1) generiraj PDF (multi-site ili single)
    let pdf;
    if (rooms.length === 1) {
      pdf = await buildPdfDocumentSingle(data);
    } else {
      pdf = await buildPdfDocumentForSite(rooms);
    }

    if (!pdf) {
      alert("Ne mogu generirati PDF.");
      return;
    }

    const blob = pdf.output("blob");
    const filenameSafe = (meta.roomName || meta.siteName || "obracun").replace(/\s+/g, "_");
    const pdfPath = `pdf/${Date.now()}_${filenameSafe}.pdf`;

    await storage.ref().child(pdfPath).put(blob);

    const saveObj = {
      meta,
      rooms,
      totalPrice,          // ukupna vrijednost ove situacije
      prevSituationsTotal, // suma prethodnih situacija (za info i kasniji PDF)
      timestamp: Date.now(),
      pdfPath
    };

    await db.collection("obracuni").add(saveObj);
    alert("Obračun spremljen u Cloud.");
  } catch (e) {
    console.error(e);
    alert("Greška pri spremanju u Cloud: " + e.message);
  }
}
