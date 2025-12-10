// js/cloud/cloudSave.js
import { state } from "../core/state.js";
import { buildPdfDocument } from "../pdf/pdfSingle.js";
import { buildPdfDocumentForSite } from "../pdf/pdfSite.js";
import { db, storage } from "./firebase-init.js";

export async function saveToCloud(data) {
  try {
    let rooms = state.siteRooms.length ? state.siteRooms : [data];

    let pdf;
    if (rooms.length === 1) pdf = buildPdfDocument(rooms[0]);
    else pdf = buildPdfDocumentForSite(rooms);

    if (!pdf) {
      alert("Ne mogu generirati PDF.");
      return;
    }

    const pdfBlob = pdf.output("blob");
    const pdfPath = `pdf/${Date.now()}_${data.meta.roomName || "prostorija"}.pdf`;

    await storage.ref().child(pdfPath).put(pdfBlob);

    const saveObj = {
      meta: data.meta,
      rooms,
      timestamp: Date.now(),
      pdfPath
    };

    await db.collection("obracuni").add(saveObj);
    alert("Obračun spremljen u Cloud.");
  } catch (e) {
    console.error(e);
    alert("Greška pri spremanju: " + e.message);
  }
}
