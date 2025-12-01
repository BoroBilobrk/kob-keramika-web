/* ---------------- FIREBASE ---------------- */

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


/* ---------------- VIEW HANDLER ---------------- */

function showView(id) {
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}


/* ---------------- AUTH ---------------- */

function registerUser() {
    const email = document.getElementById("regEmail").value;
    const pass = document.getElementById("regPass").value;

    auth.createUserWithEmailAndPassword(email, pass)
        .then(() => alert("Registracija uspješna!"))
        .catch(err => alert(err.message));
}

function loginUser() {
    const email = document.getElementById("loginEmail").value;
    const pass = document.getElementById("loginPass").value;

    auth.signInWithEmailAndPassword(email, pass)
        .then(() => showView("homeView"))
        .catch(err => alert(err.message));
}

function logoutUser() {
    auth.signOut().then(() => showView("loginView"));
}


/* ---------------- LISTENER ---------------- */

auth.onAuthStateChanged(user => {
    if (user) showView("homeView");
    else showView("loginView");
});
