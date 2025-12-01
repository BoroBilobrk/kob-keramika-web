alert("app.js je učitan");/* ============================
   LOGIN / LOGOUT
============================ */

async function loginUser() {
    const email = document.getElementById("loginEmail").value.trim();
    const pass = document.getElementById("loginPass").value.trim();

    try {
        await firebase.auth().signInWithEmailAndPassword(email, pass);
        showMainApp();
    } catch (err) {
        alert("Greška: " + err.message);
    }
}

async function registerUser() {
    const email = document.getElementById("regEmail").value.trim();
    const pass = document.getElementById("regPass").value.trim();

    if (pass.length < 6) {
        alert("Lozinka mora imati barem 6 znakova.");
        return;
    }

    try {
        await firebase.auth().createUserWithEmailAndPassword(email, pass);
        alert("Registracija uspješna!");
    } catch (err) {
        alert("Greška: " + err.message);
    }
}

function logoutUser() {
    firebase.auth().signOut();
}

/* ============================
   LISTENER AUTENTIKACIJE
============================ */

firebase.auth().onAuthStateChanged(user => {
    if (user) {
        showMainApp();
    } else {
        showAuth();
    }
});

/* ============================
   PRIKAZI
============================ */

function showAuth() {
    document.getElementById("authBox").classList.remove("hidden");
    document.getElementById("mainApp").classList.add("hidden");
}

function showMainApp() {
    document.getElementById("authBox").classList.add("hidden");
    document.getElementById("mainApp").classList.remove("hidden");
}
