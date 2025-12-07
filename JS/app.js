// KOB-Keramika – osnovna aplikacijska logika (login + prikaz ekrana)

function showView(id) {
  const views = document.querySelectorAll(".view");
  views.forEach(v => {
    if (v.id === id) {
      v.classList.add("active");
      v.style.display = "";
    } else {
      v.classList.remove("active");
      v.style.display = "none";
    }
  });
}

async function loginUser() {
  const emailEl = document.getElementById("loginEmail");
  const passEl = document.getElementById("loginPass");
  const email = emailEl ? emailEl.value.trim() : "";
  const pass = passEl ? passEl.value.trim() : "";

  if (!email || !pass) {
    alert("Unesi e-mail i lozinku.");
    return;
  }

  try {
    await firebase.auth().signInWithEmailAndPassword(email, pass);
  } catch (err) {
    console.error(err);
    alert("Prijava nije uspjela. Provjeri podatke.");
  }
}

async function registerUser() {
  const emailEl = document.getElementById("loginEmail");
  const passEl = document.getElementById("loginPass");
  const email = emailEl ? emailEl.value.trim() : "";
  const pass = passEl ? passEl.value.trim() : "";

  if (!email || !pass) {
    alert("Za registraciju unesi e-mail i lozinku.");
    return;
  }

  try {
    await firebase.auth().createUserWithEmailAndPassword(email, pass);
    alert("Registracija uspješna. Sada se možeš prijaviti.");
  } catch (err) {
    console.error(err);
    alert("Registracija nije uspjela. Možda korisnik već postoji.");
  }
}

async function logoutUser() {
  try {
    await firebase.auth().signOut();
  } catch (err) {
    console.error(err);
  }
}

function initAuthListener() {
  if (!firebase || !firebase.auth) {
    console.warn("Firebase Auth nije inicijaliziran.");
    return;
  }

  const logoutBtn = document.getElementById("btnLogout");

  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      // korisnik prijavljen → prikaži početni ekran
      showView("homeView");
      if (logoutBtn) logoutBtn.style.display = "inline-block";
    } else {
      // nije prijavljen → login
      showView("loginView");
      if (logoutBtn) logoutBtn.style.display = "none";
    }
  });
}

function initApp() {
  // na startu sakrij sve view-ove osim login-a
  const views = document.querySelectorAll(".view");
  views.forEach(v => {
    if (v.id !== "loginView") {
      v.classList.remove("active");
      v.style.display = "none";
    } else {
      v.classList.add("active");
      v.style.display = "";
    }
  });

  initAuthListener();
}

document.addEventListener("DOMContentLoaded", initApp);

// Global na window da HTML onclick radi
window.loginUser = loginUser;
window.registerUser = registerUser;
window.logoutUser = logoutUser;
window.showView = showView;
