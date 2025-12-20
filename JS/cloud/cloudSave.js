// JS/cloud/cloudSave.js
import { AppState } from "../core/state.js";
import { buildPdfDocument, buildPdfDocumentForSite } from "../pdf/pdfSingle.js";
import { db, storage } from "./firebase-init.js";
import { pricesToPlainObject } from "../calculations/cjenik.js";

export async function saveToCloud(data) {
  try {
    // ako ima više prostorija na gradilištu, spremamo sve;
    // inače samo trenutnu
    const rooms = AppState.siteRooms.length ? AppState.siteRooms : [data];

    let pdf;
    if (rooms.length === 1) {
      pdf = await buildPdfDocument(data);
    } else {
      pdf = await buildPdfDocumentForSite(rooms);
    }

    if (!pdf) {
      alert("Ne mogu generirati PDF.");
      return;
    }

    const blob = pdf.output("blob");
    const meta = data.meta || {};

    const filenameSafe = (meta.roomName || "prostorija").replace(/\s+/g, "_");
    const pdfPath = `pdf/${Date.now()}_${filenameSafe}.pdf`;

    await storage.ref().child(pdfPath).put(blob);

    // spremi i cjenik koji je tada vrijedio
    const pricesTemplate = pricesToPlainObject();

    const saveObj = {
      meta,
      rooms,
      pricesTemplate,
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
