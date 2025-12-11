// JS/cloud/cloudSave.js
import { AppState } from "../core/state.js";
import { buildPdfDocumentSingle } from "../pdf/pdfSingle.js";
import { buildPdfDocumentForSite } from "../pdf/pdfSite.js";
import { db, storage } from "./firebase-init.js";

export async function saveToCloud(data) {
  try {
    const rooms = AppState.siteRooms.length ? AppState.siteRooms : [data];

    let pdf;
    if (rooms.length === 1) pdf = buildPdfDocumentSingle(data);
    else pdf = buildPdfDocumentForSite(rooms);

    if (!pdf) {
      alert("Ne mogu generirati PDF.");
      return;
    }

    const blob = pdf.output("blob");
    const meta = data.meta || {};
    const filenameSafe = (meta.roomName || "prostorija").replace(/\s+/g, "_");
    const pdfPath = `pdf/${Date.now()}_${filenameSafe}.pdf`;

    await storage.ref().child(pdfPath).put(blob);

    const saveObj = {
      meta,
      rooms,
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
