// JS/cloud/firebase-init.js

// TODO: zamijeni ovim svojim stvarnim konfiguracijskim podacima
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

export const db = firebase.firestore();
export const storage = firebase.storage();
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /obracuni/{docId} {
      allow read, write: if true;
    }
  }
}
