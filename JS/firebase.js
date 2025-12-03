// Firebase inicijalizacija
const firebaseConfig = {
  apiKey: "AIzaSyDIuDJqFE3G2yk98WPwGHkc6xomWXUdu3o",
  authDomain: "kob-keramika.firebaseapp.com",
  projectId: "kob-keramika",
  storageBucket: "kob-keramika.firebasestorage.app",
  messagingSenderId: "604488601212",
  appId: "1:604488601212:web:70552af260d9e5a283c3f9",
  measurementId: "G-KDTBSP3H39"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// Spremanje situacije za korisnika
async function firebaseSaveSituation(userName, situation, pdfBlob) {
  const now = new Date();
  const docRef = await db.collection("situations").add({
    userName,
    meta: situation.meta || {},
    totals: situation.totals || {},
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    createdAtLocal: now.toISOString()
  });

  const pdfPath = `situations/${userName}/${docRef.id}.pdf`;
  const storageRef = storage.ref().child(pdfPath);
  await storageRef.put(pdfBlob);
  const pdfUrl = await storageRef.getDownloadURL();

  await docRef.update({ pdfPath, pdfUrl });
  return { id: docRef.id, pdfUrl };
}

// Dohvat situacija za korisnika
async function firebaseLoadSituationsForUser(userName) {
  const snap = await db.collection("situations")
    .where("userName", "==", userName)
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();

  const out = [];
  snap.forEach(doc => {
    const data = doc.data();
    out.push({
      id: doc.id,
      meta: data.meta || {},
      totals: data.totals || {},
      pdfUrl: data.pdfUrl || null,
      createdAt: data.createdAtLocal || ""
    });
  });
  return out;
}

window.firebaseSaveSituation = firebaseSaveSituation;
window.firebaseLoadSituationsForUser = firebaseLoadSituationsForUser;
