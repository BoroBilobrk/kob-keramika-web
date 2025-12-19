// JS/cloud/situacije.js
// ===================================
// SPREMANJE + ZBROJ SITUACIJA
// ===================================

export async function saveSituation(db, data) {
  const site = data.meta.siteCode;
  const sit = data.meta.situationNo;

  if (!site || !sit) {
    alert("Nedostaje siteCode ili broj situacije");
    return;
  }

  await db
    .collection("gradilista")
    .doc(site)
    .collection("situacije")
    .doc(sit)
    .set(data);
}

export async function loadPrevTotal(db, siteCode) {
  let sum = 0;

  const snap = await db
    .collection("gradilista")
    .doc(siteCode)
    .collection("situacije")
    .get();

  snap.forEach(d => {
    sum += d.data().total || 0;
  });

  return sum;
}
