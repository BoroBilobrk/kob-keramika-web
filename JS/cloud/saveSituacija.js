// JS/cloud/saveSituacija.js
import { db } from "./firebase.js";

export async function saveSituacija(siteCode, situacija) {
  const siteRef = db.collection("gradilista").doc(siteCode);

  // osiguraj da gradilište postoji
  await siteRef.set({
    siteName: situacija.meta.siteName,
    investor: situacija.meta.investorName,
    contractValue: situacija.meta.contractValue || 0,
    updatedAt: new Date()
  }, { merge: true });

  // spremi situaciju
  await siteRef
    .collection("situacije")
    .doc(situacija.meta.situationNo)
    .set({
      ...situacija,
      createdAt: new Date()
    });
}
