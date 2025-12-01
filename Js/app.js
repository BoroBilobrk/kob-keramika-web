// JS/app.js

function loginUser() {
  const email = document.getElementById("loginEmail").value.trim();
  const pass = document.getElementById("loginPass").value.trim();

  if (!email || !pass) {
    alert("Unesi email i lozinku.");
    return;
  }

  firebase.auth().signInWithEmailAndPassword(email, pass)
    .catch(err => alert("Greška: " + err.message));
}

function registerUser() {
  const email = document.getElementById("regEmail").value.trim();
  const pass = document.getElementById("regPass").value.trim();

  if (!email || !pass) {
    alert("Unesi email i lozinku.");
    return;
  }
  if (pass.length < 6) {
    alert("Lozinka mora imati barem 6 znakova.");
    return;
  }

  firebase.auth().createUserWithEmailAndPassword(email, pass)
    .then(() => alert("Registracija uspješna! Sada se prijavi."))
    .catch(err => alert("Greška: " + err.message));
}

function logoutUser() {
  firebase.auth().signOut();
}

// prikaži login ili app ovisno o stanju
firebase.auth().onAuthStateChanged(user => {
  const authBox = document.getElementById("authBox");
  const mainApp = document.getElementById("mainApp");
  const userEmailLabel = document.getElementById("kobUserEmail");

  if (user) {
    authBox.classList.add("hidden");
    mainApp.classList.remove("hidden");
    if (userEmailLabel) userEmailLabel.textContent = user.email || "";

    // inicijaliziraj UI modula (samo jednom)
    if (!window.__kobAppInitialized) {
      kobInitAllViews();
      window.__kobAppInitialized = true;
    }
  } else {
    authBox.classList.remove("hidden");
    mainApp.classList.add("hidden");
  }
});

// navigacija između tabova
document.addEventListener("DOMContentLoaded", () => {
  const navButtons = document.querySelectorAll(".nav-btn");
  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      navButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const view = btn.getAttribute("data-view");
      kobShowView(view);
    });
  });
});
