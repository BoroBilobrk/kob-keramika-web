// JS/cloud/getSituationsSummary.js
import { db } from "./firebase.js";

export async function getSituationsSummary(siteCode) {
  const snap = await db
    .collection("gradilista")
    .doc(siteCode)
    .collection("situacije")
    .get();

  let totalExecuted = 0;
  let hasFinal = false;

  snap.forEach(doc => {
    const s = doc.data();
    totalExecuted += s.total || 0;
    if (s.type === "okončana") hasFinal = true;
  });

  return {
    totalExecuted,
    hasFinal
  };
}
