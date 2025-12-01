// js/firebase.js

// Firebase config – tvoj
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
const auth = firebase.auth();
const db = firebase.firestore();

// izvezemo globalno (nije nužno ali pomaže)
window.__kobAuth = auth;
window.__kobDb = db;
