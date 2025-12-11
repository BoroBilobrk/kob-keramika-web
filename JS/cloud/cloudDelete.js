// JS/cloud/cloudDelete.js
import { db, storage } from "./firebase-init.js";
import { loadArchive } from "./cloudLoad.js";

export async function deleteCloudRecord(id) {
  if (!confirm("Stvarno obrisati ovaj obračun i njegov PDF?")) return;
  try {
    const docSnap = await db.collection("obracuni").doc(id).get();
    if (docSnap.exists) {
      const d = docSnap.data();
      if (d.pdfPath) {
        try {
          await storage.ref().child(d.pdfPath).delete();
        } catch (e) {
          console.warn("Ne mogu obrisati PDF iz Storage-a:", e.message);
        }
      }
    }
    await db.collection("obracuni").doc(id).delete();
    alert("Obračun obrisan.");
    loadArchive();
  } catch (e) {
    console.error(e);
    alert("Greška pri brisanju: " + e.message);
  }
}
